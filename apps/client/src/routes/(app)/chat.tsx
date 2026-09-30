import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  isTextUIPart,
  isToolUIPart,
  type UIMessage,
} from 'ai';
import { ChevronDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Chat,
  ChatAvatar,
  ChatBubble,
  ChatComposer,
  type ChatComposerHandle,
  ChatEmpty,
  ChatMessage,
  ChatMessageHeader,
  ChatMessages,
  ChatTool,
  type ChatToolPart,
  ChatTypingIndicator,
} from '@/components/ui/chat';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Response } from '@/components/ui/response';
import { env } from '@/env';
import { useProfileQuery } from '@/graphql/generated';
import { useAuth } from '@/providers/auth-provider';

const CHAT_THREAD_STORAGE_KEY = 'chat.threadId';

const buildSessionStartMessage = (profileId: string): string =>
  `Session started for account: "${profileId}"`;

const initialMessageStorageKey = (threadId: string): string =>
  `chat.initialMessageSent.${threadId}`;

const CHAT_AGENT_IDS = [
  'agent',
  'savings-advice-agent',
  'expense-insight-agent',
] as const;

type ChatAgentId = (typeof CHAT_AGENT_IDS)[number];

const DEFAULT_CHAT_AGENT_ID: ChatAgentId = 'agent';

// Only Kate has server-side memory; the other agents need the full history per request.
const AGENTS_WITH_MEMORY: ReadonlySet<ChatAgentId> = new Set(['agent']);

interface ChatMessageMetadata {
  agentId?: ChatAgentId;
}

type ChatUIMessage = UIMessage<ChatMessageMetadata>;

const isChatAgentId = (value: unknown): value is ChatAgentId =>
  typeof value === 'string' &&
  (CHAT_AGENT_IDS as ReadonlyArray<string>).includes(value);

const getOrCreateThreadId = (): string => {
  const existing = sessionStorage.getItem(CHAT_THREAD_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const threadId = crypto.randomUUID();
  sessionStorage.setItem(CHAT_THREAD_STORAGE_KEY, threadId);
  return threadId;
};

const getMessageText = (message: UIMessage): string =>
  message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join('');

interface TextSegment {
  kind: 'text';
  key: string;
  text: string;
}

interface ToolSegment {
  kind: 'tool';
  key: string;
  part: ChatToolPart;
}

type MessageSegment = TextSegment | ToolSegment;

/**
 * Splits message parts into renderable segments, preserving order and merging adjacent text parts.
 */
const getMessageSegments = (message: UIMessage): Array<MessageSegment> => {
  const segments: Array<MessageSegment> = [];

  message.parts.forEach((part, index) => {
    if (isTextUIPart(part)) {
      const previous = segments.at(-1);
      if (previous?.kind === 'text') {
        previous.text += part.text;
        return;
      }
      segments.push({ kind: 'text', key: `text-${index}`, text: part.text });
      return;
    }

    if (isToolUIPart(part)) {
      segments.push({ kind: 'tool', key: part.toolCallId, part });
    }
  });

  return segments.filter(
    (segment) => segment.kind !== 'text' || segment.text.length > 0
  );
};

/**
 * Attributes every assistant message to the agent selected when the preceding user message was sent.
 */
const getMessageAgentIds = (
  messages: Array<ChatUIMessage>
): Map<string, ChatAgentId> => {
  const result = new Map<string, ChatAgentId>();
  let currentAgentId: ChatAgentId = DEFAULT_CHAT_AGENT_ID;

  for (const message of messages) {
    if (message.role === 'user' && isChatAgentId(message.metadata?.agentId)) {
      currentAgentId = message.metadata.agentId;
    }
    result.set(message.id, currentAgentId);
  }

  return result;
};

interface ChatAgentSelectorProps {
  value: ChatAgentId;
  onChange: (agentId: ChatAgentId) => void;
  isDisabled?: boolean;
}

const ChatAgentSelector = ({
  value,
  onChange,
  isDisabled = false,
}: ChatAgentSelectorProps) => {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={isDisabled}
          aria-label={t('chat.agentSelector.label')}
          className='h-9 shrink-0'>
          {t(`chat.agents.${value}.name`)}
          <ChevronDownIcon className='opacity-60' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => {
            if (isChatAgentId(next)) {
              onChange(next);
            }
          }}>
          {CHAT_AGENT_IDS.map((agentId) => (
            <DropdownMenuRadioItem
              key={agentId}
              value={agentId}>
              <span className='flex flex-col gap-0.5'>
                <span>{t(`chat.agents.${agentId}.name`)}</span>
                <span className='text-muted-foreground text-xs'>
                  {t(`chat.agents.${agentId}.description`)}
                </span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ChatScreen = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const resourceId = user?.username ?? 'anonymous';
  const threadId = useMemo(() => getOrCreateThreadId(), []);
  const [agentId, setAgentId] = useState<ChatAgentId>(DEFAULT_CHAT_AGENT_ID);
  const { data: profileData } = useProfileQuery();
  const profileId = profileData?.profile.profileId ?? null;

  const transport = useMemo(
    () =>
      new DefaultChatTransport<ChatUIMessage>({
        api: `${env.VITE_AGENTS_URL}/chat/${agentId}`,
        prepareSendMessagesRequest({ messages }) {
          const outgoing = AGENTS_WITH_MEMORY.has(agentId)
            ? messages.slice(-1)
            : messages;
          return {
            body: {
              messages: outgoing,
              memory: {
                thread: threadId,
                resource: resourceId,
              },
              ...(profileId ? { requestContext: { profileId } } : {}),
            },
          };
        },
      }),
    [agentId, profileId, resourceId, threadId]
  );

  const { messages, sendMessage, status, error } = useChat<ChatUIMessage>({
    id: threadId,
    transport,
  });

  const composerRef = useRef<ChatComposerHandle>(null);
  const initialMessageSentRef = useRef(false);

  const sendChatText = useCallback(
    (text: string, messageAgentId: ChatAgentId) => {
      sendMessage({ text, metadata: { agentId: messageAgentId } }).catch(
        () => undefined
      );
    },
    [sendMessage]
  );

  useEffect(() => {
    if (!profileId || status !== 'ready' || initialMessageSentRef.current) {
      return;
    }

    if (sessionStorage.getItem(initialMessageStorageKey(threadId)) === '1') {
      initialMessageSentRef.current = true;
      return;
    }

    initialMessageSentRef.current = true;
    sessionStorage.setItem(initialMessageStorageKey(threadId), '1');

    const initialText = buildSessionStartMessage(profileId);
    if (composerRef.current) {
      composerRef.current.send(initialText);
    } else {
      sendChatText(initialText, DEFAULT_CHAT_AGENT_ID);
    }
  }, [profileId, sendChatText, status, threadId]);

  const messageAgentIds = useMemo(
    () => getMessageAgentIds(messages),
    [messages]
  );

  const isPending = status === 'submitted' || status === 'streaming';
  const lastMessage = messages.at(-1);
  const showTyping =
    isPending &&
    (!lastMessage ||
      lastMessage.role === 'user' ||
      (lastMessage.role === 'assistant' &&
        !lastMessage.parts.some(
          (part) => isTextUIPart(part) && part.text.length > 0
        )));

  const handleComposerSend = useCallback(
    (text: string) => {
      const messageAgentId =
        text === buildSessionStartMessage(profileId ?? '')
          ? DEFAULT_CHAT_AGENT_ID
          : agentId;
      sendChatText(text, messageAgentId);
    },
    [agentId, profileId, sendChatText]
  );

  const visibleMessages = useMemo(
    () =>
      messages.filter(
        (message) =>
          message.role !== 'user' ||
          profileId === null ||
          getMessageText(message) !== buildSessionStartMessage(profileId)
      ),
    [messages, profileId]
  );

  return (
    <Chat
      className='min-h-0 flex-1 rounded-xl border'
      scroller={{
        autoScroll: true,
        defaultScrollPosition: 'last-anchor',
        scrollPreviousItemPeek: 64,
      }}>
      {visibleMessages.length === 0 && !showTyping ? (
        <ChatEmpty>{t(`chat.agents.${agentId}.empty`)}</ChatEmpty>
      ) : (
        <ChatMessages>
          {visibleMessages.map((message) => {
            if (message.role === 'system') {
              return null;
            }

            const isUser = message.role === 'user';
            const messageAgentId =
              messageAgentIds.get(message.id) ?? DEFAULT_CHAT_AGENT_ID;
            const name = isUser
              ? t('chat.author.user')
              : t(`chat.agents.${messageAgentId}.name`);
            const segments = getMessageSegments(message);

            return (
              <ChatMessage
                key={message.id}
                messageId={message.id}
                align={isUser ? 'end' : 'start'}
                isScrollAnchor={isUser}
                avatar={
                  <ChatAvatar
                    name={name}
                    src={isUser ? undefined : '/kbc-logo.png'}
                  />
                }>
                <ChatMessageHeader>{name}</ChatMessageHeader>
                {segments.map((segment) =>
                  segment.kind === 'tool' ? (
                    <ChatTool
                      key={segment.key}
                      part={segment.part}
                    />
                  ) : (
                    <ChatBubble key={segment.key}>
                      {isUser ? (
                        <span className='whitespace-pre-line'>
                          {segment.text}
                        </span>
                      ) : (
                        <Response>{segment.text}</Response>
                      )}
                    </ChatBubble>
                  )
                )}
              </ChatMessage>
            );
          })}
          {!!showTyping && (
            <ChatMessage messageId='typing'>
              <ChatTypingIndicator />
            </ChatMessage>
          )}
        </ChatMessages>
      )}
      {!!error && (
        <p
          role='alert'
          className='text-destructive px-3 pb-1 text-sm'>
          {t('chat.error')}
        </p>
      )}
      <ChatComposer
        ref={composerRef}
        onSend={handleComposerSend}
        isPending={isPending}>
        <ChatAgentSelector
          value={agentId}
          onChange={setAgentId}
          isDisabled={isPending}
        />
      </ChatComposer>
    </Chat>
  );
};

export default ChatScreen;
