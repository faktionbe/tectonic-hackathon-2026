import { useTranslation } from 'react-i18next';
import { type ParsedLocation, useRouter } from '@tanstack/react-router';

export interface NavItem {
  title: string;
  description?: string;
  location: ParsedLocation;
  items?: Array<NavItem>;
}

/**
 * All application configuration should be stored/handled here.
 * Purpose of this hook: if a new project is setup using the kickstart template, you only need to modify this hook to change the application configuration.
 */
export function useAppConfig(): {
  name: string;
  logo: React.ReactNode;
  items: Array<NavItem>;
} {
  const { t } = useTranslation();
  const router = useRouter();
  return {
    name: 'KBC',
    logo: (
      <img
        src='/kbc-logo.png'
        alt='KBC'
        className='size-8 object-contain'
      />
    ),
    items: [
      {
        title: t('navigation.chat.title'),
        location: router.buildLocation({
          to: '/app/chat',
        }),
      },
    ],
  };
}
