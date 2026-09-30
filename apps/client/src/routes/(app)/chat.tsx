import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, isTextUIPart, type UIMessage } from 'ai';

import {
  Chat,
  ChatAvatar,
  ChatBubble,
  ChatComposer,
  ChatEmpty,
  ChatMessage,
  ChatMessageHeader,
  ChatMessages,
  ChatTypingIndicator,
} from '@/components/ui/chat';
import { Response } from '@/components/ui/response';
import { env } from '@/env';
import { useAuth } from '@/providers/auth-provider';

const CHAT_THREAD_STORAGE_KEY = 'chat.threadId';

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

const ChatScreen = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const resourceId = user?.username ?? 'anonymous';
  const threadId = useMemo(() => getOrCreateThreadId(), []);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${env.VITE_AGENTS_URL}/chat`,
        prepareSendMessagesRequest({ messages }) {
          const lastMessage = messages.at(-1);
          return {
            body: {
              messages: lastMessage ? [lastMessage] : [],
              memory: {
                thread: threadId,
                resource: resourceId,
              },
            },
          };
        },
      }),
    [resourceId, threadId]
  );

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    transport,
  });

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

  const handleSend = (text: string): void => {
    sendMessage({ text }).catch(() => undefined);
  };

  return (
    <Chat
      className='min-h-0 flex-1 rounded-xl border'
      scroller={{
        autoScroll: true,
        defaultScrollPosition: 'last-anchor',
        scrollPreviousItemPeek: 64,
      }}>
      {messages.length === 0 && !showTyping ? (
        <ChatEmpty>{t('chat.empty')}</ChatEmpty>
      ) : (
        <ChatMessages>
          {messages.map((message) => {
            if (message.role === 'system') {
              return null;
            }

            const isUser = message.role === 'user';
            const name = isUser
              ? t('chat.author.user')
              : t('chat.author.assistant');
            const text = getMessageText(message);

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
                <ChatBubble>
                  {isUser ? (
                    <span className='whitespace-pre-line'>{text}</span>
                  ) : (
                    <Response>{text}</Response>
                  )}
                </ChatBubble>
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
        onSend={handleSend}
        isPending={isPending}
      />
    </Chat>
  );
};

export default ChatScreen;
