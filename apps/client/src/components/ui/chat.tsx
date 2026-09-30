import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { type DynamicToolUIPart, getToolName, type ToolUIPart } from 'ai';
import { ArrowDownIcon, SendHorizontalIcon } from 'lucide-react';

import { CodeBlock } from '@/components/code-block';
import { Tool } from '@/components/tool';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from '@/components/ui/bubble';
import { Button } from '@/components/ui/button';
import { Marker, MarkerContent } from '@/components/ui/marker';
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from '@/components/ui/message';
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type ChatAlign = 'start' | 'end';

interface ChatMessageContextValue {
  align: ChatAlign;
}

const ChatMessageContext = React.createContext<ChatMessageContextValue>({
  align: 'start',
});

interface ChatProps extends React.ComponentProps<'div'> {
  scroller?: Omit<
    React.ComponentProps<typeof MessageScrollerProvider>,
    'children'
  >;
}

const Chat = ({
  scroller,
  className,
  children,
  ...props
}: ChatProps): React.ReactElement => (
  <MessageScrollerProvider {...scroller}>
    <div
      data-slot='chat'
      className={cn('flex h-full min-h-0 w-full flex-col', className)}
      {...props}>
      {children}
    </div>
  </MessageScrollerProvider>
);

const ChatMessages = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MessageScrollerContent>): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <MessageScroller
      data-slot='chat-messages'
      className='flex-1'>
      <MessageScrollerViewport>
        <MessageScrollerContent
          className={cn('gap-4 p-4', className)}
          {...props}>
          {children}
        </MessageScrollerContent>
      </MessageScrollerViewport>
      <MessageScrollerButton>
        <ArrowDownIcon />
        <span className='sr-only'>{t('chat.scrollToEnd')}</span>
      </MessageScrollerButton>
    </MessageScroller>
  );
};

const ChatEmpty = ({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement => (
  <div
    data-slot='chat-empty'
    className={cn(
      'text-muted-foreground flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-sm',
      className
    )}
    {...props}
  />
);

interface ChatMessageProps extends React.ComponentProps<typeof Message> {
  messageId?: string;
  avatar?: React.ReactNode;
  isScrollAnchor?: boolean;
}

const ChatMessage = ({
  messageId,
  avatar,
  align = 'start',
  isScrollAnchor = false,
  children,
  ...props
}: ChatMessageProps): React.ReactElement => {
  const contextValue = React.useMemo(() => ({ align }), [align]);

  return (
    <MessageScrollerItem
      messageId={messageId}
      scrollAnchor={isScrollAnchor}>
      <ChatMessageContext value={contextValue}>
        <Message
          align={align}
          {...props}>
          {!!avatar && <MessageAvatar>{avatar}</MessageAvatar>}
          <MessageContent>{children}</MessageContent>
        </Message>
      </ChatMessageContext>
    </MessageScrollerItem>
  );
};

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

interface ChatAvatarProps extends React.ComponentProps<typeof Avatar> {
  name: string;
  src?: string;
}

const ChatAvatar = ({
  name,
  src,
  ...props
}: ChatAvatarProps): React.ReactElement => (
  <Avatar {...props}>
    {!!src && (
      <AvatarImage
        src={src}
        alt={name}
      />
    )}
    <AvatarFallback className='text-xs'>{getInitials(name)}</AvatarFallback>
  </Avatar>
);

interface ChatBubbleProps extends React.ComponentProps<typeof Bubble> {
  reactions?: React.ReactNode;
}

const ChatBubble = ({
  variant,
  reactions,
  className,
  children,
  ...props
}: ChatBubbleProps): React.ReactElement => {
  const { align } = React.useContext(ChatMessageContext);
  const resolvedVariant = variant ?? (align === 'end' ? 'default' : 'muted');

  return (
    <Bubble
      variant={resolvedVariant}
      align={align}
      className={cn(!!reactions && 'mb-3', className)}
      {...props}>
      <BubbleContent>{children}</BubbleContent>
      {!!reactions && <BubbleReactions>{reactions}</BubbleReactions>}
    </Bubble>
  );
};

type ChatToolPart = ToolUIPart | DynamicToolUIPart;

const renderToolOutput = (output: unknown): React.ReactNode => {
  if (output === undefined || output === null) {
    return null;
  }

  if (typeof output === 'string') {
    return <div className='whitespace-pre-wrap p-3'>{output}</div>;
  }

  return (
    <CodeBlock
      code={JSON.stringify(output, null, 2)}
      language='json'
    />
  );
};

interface ChatToolProps
  extends Omit<React.ComponentProps<typeof Tool>, 'children' | 'part'> {
  part: ChatToolPart;
}

const ChatTool = ({
  part,
  className,
  ...props
}: ChatToolProps): React.ReactElement => (
  <Tool
    data-slot='chat-tool'
    className={cn('mb-0', className)}
    {...props}>
    <Tool.Header
      type={part.type}
      title={getToolName(part)}
      state={part.state}
    />
    <Tool.Content>
      {part.input !== undefined && <Tool.Input input={part.input} />}
      <Tool.Output
        output={renderToolOutput(part.output)}
        errorText={part.errorText}
      />
    </Tool.Content>
  </Tool>
);

const ChatMarker = ({
  variant = 'separator',
  children,
  ...props
}: React.ComponentProps<typeof Marker>): React.ReactElement => (
  <Marker
    variant={variant}
    {...props}>
    <MarkerContent>{children}</MarkerContent>
  </Marker>
);

const ChatTypingIndicator = ({
  children,
  ...props
}: React.ComponentProps<typeof Marker>): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <Marker
      role='status'
      aria-live='polite'
      {...props}>
      <MarkerContent className='shimmer'>
        {children ?? t('chat.typing')}
      </MarkerContent>
    </Marker>
  );
};

interface ChatComposerHandle {
  send: (text: string) => void;
}

interface ChatComposerProps
  extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  onSend: (text: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  isPending?: boolean;
}

// eslint-disable-next-line react/display-name
const ChatComposer = React.forwardRef<ChatComposerHandle, ChatComposerProps>(
  (
    {
      onSend,
      placeholder,
      isDisabled = false,
      isPending = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation();
    const [text, setText] = React.useState('');
    const trimmedText = text.trim();
    const canSend = !!trimmedText && !isDisabled && !isPending;

    React.useImperativeHandle(
      ref,
      () => ({
        send: (message: string) => {
          const trimmed = message.trim();
          if (!trimmed || isDisabled || isPending) {
            return;
          }
          onSend(trimmed);
        },
      }),
      [isDisabled, isPending, onSend]
    );

    const submit = (): void => {
      if (!canSend) return;
      setText('');
      onSend(trimmedText);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      submit();
    };

    const handleKeyDown = (
      event: React.KeyboardEvent<HTMLTextAreaElement>
    ): void => {
      if (
        event.key === 'Enter' &&
        !event.shiftKey &&
        !event.nativeEvent.isComposing
      ) {
        event.preventDefault();
        submit();
      }
    };

    return (
      <form
        data-slot='chat-composer'
        className={cn('flex items-end gap-2 border-t p-3', className)}
        onSubmit={handleSubmit}
        {...props}>
        {children}
        <Textarea
          value={text}
          onChange={(event) => {
            setText(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? t('chat.composer.placeholder')}
          disabled={isDisabled}
          aria-label={placeholder ?? t('chat.composer.placeholder')}
          rows={1}
          className='max-h-40 min-h-9 flex-1 resize-none'
        />
        <Button
          type='submit'
          size='icon'
          disabled={!canSend}
          aria-busy={isPending}>
          <SendHorizontalIcon />
          <span className='sr-only'>{t('chat.composer.send')}</span>
        </Button>
      </form>
    );
  }
);

export {
  Chat,
  ChatAvatar,
  ChatBubble,
  BubbleGroup as ChatBubbleGroup,
  ChatComposer,
  type ChatComposerHandle,
  ChatEmpty,
  ChatMarker,
  ChatMessage,
  MessageFooter as ChatMessageFooter,
  MessageHeader as ChatMessageHeader,
  ChatMessages,
  ChatTool,
  type ChatToolPart,
  ChatTypingIndicator,
};
