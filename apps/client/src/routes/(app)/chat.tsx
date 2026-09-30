import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Chat,
  ChatAvatar,
  ChatBubble,
  ChatComposer,
  ChatEmpty,
  ChatMarker,
  ChatMessage,
  ChatMessageHeader,
  ChatMessages,
} from '@/components/ui/chat';

interface ChatEntry {
  id: string;
  author: 'user' | 'assistant';
  text: string;
}

const MOCK_CONVERSATION = [
  { id: 'welcome', author: 'assistant', key: 'chat.mock.welcome' },
  { id: 'how', author: 'user', key: 'chat.mock.how' },
  { id: 'evidence', author: 'assistant', key: 'chat.mock.evidence' },
  { id: 'confirm', author: 'user', key: 'chat.mock.confirm' },
  { id: 'plan', author: 'assistant', key: 'chat.mock.plan' },
  { id: 'savings-yes', author: 'user', key: 'chat.mock.savingsYes' },
  { id: 'done', author: 'assistant', key: 'chat.mock.done' },
] as const;

const ChatScreen = () => {
  const { t } = useTranslation();
  const [sentMessages, setSentMessages] = useState<Array<ChatEntry>>([]);

  const messages: Array<ChatEntry> = [
    ...MOCK_CONVERSATION.map((message) => ({
      id: message.id,
      author: message.author,
      text: t(message.key),
    })),
    ...sentMessages,
  ];

  const handleSend = (text: string): void => {
    setSentMessages((prev) => [
      ...prev,
      { id: `sent-${prev.length + 1}`, author: 'user', text },
    ]);
  };

  return (
    <Chat
      className='min-h-0 flex-1 rounded-xl border'
      scroller={{
        autoScroll: true,
        defaultScrollPosition: 'last-anchor',
        scrollPreviousItemPeek: 64,
      }}>
      {messages.length === 0 ? (
        <ChatEmpty>{t('chat.empty')}</ChatEmpty>
      ) : (
        <ChatMessages>
          <ChatMessage messageId='date'>
            <ChatMarker>{t('chat.mock.date')}</ChatMarker>
          </ChatMessage>
          {messages.map((message) => {
            const name =
              message.author === 'user'
                ? t('chat.author.user')
                : t('chat.author.assistant');

            return (
              <ChatMessage
                key={message.id}
                messageId={message.id}
                align={message.author === 'user' ? 'end' : 'start'}
                isScrollAnchor={message.author === 'user'}
                avatar={
                  <ChatAvatar
                    name={name}
                    src={
                      message.author === 'assistant'
                        ? '/kbc-logo.png'
                        : undefined
                    }
                  />
                }>
                <ChatMessageHeader>{name}</ChatMessageHeader>
                <ChatBubble>
                  <span className='whitespace-pre-line'>{message.text}</span>
                </ChatBubble>
              </ChatMessage>
            );
          })}
        </ChatMessages>
      )}
      <ChatComposer onSend={handleSend} />
    </Chat>
  );
};

export default ChatScreen;
