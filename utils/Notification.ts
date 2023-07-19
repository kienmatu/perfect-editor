import { notifications } from '@mantine/notifications';

export const showSuccessNotification = (title: string, message: string) => {
  notifications.show({
    title: title,
    message: message,
    withBorder: true,
    styles: (theme) => ({
      root: {
        backgroundColor: theme.white,
        borderColor: theme.colors.gray[6],

        '&::before': { backgroundColor: theme.colors.green[6] },
      },

      title: { color: theme.black },
      description: { color: theme.colors.gray },
      closeButton: {
        color: theme.white,
        '&:hover': { backgroundColor: theme.colors.green[7] },
      },
    }),
  });
};
