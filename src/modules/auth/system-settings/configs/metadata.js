import { getI18n } from '@/plugins/i18n'

const t = key => getI18n().global.t(key)

export const SYSTEM_SETTINGS_TABS = [
  { value: 'system-settings-general', icon: 'tabler-settings', titleKey: 'system-settings.system_settings.layout.tabs.general' },
  { value: 'system-settings-admin-experience', icon: 'tabler-device-desktop', titleKey: 'system-settings.system_settings.layout.tabs.admin' },
  { value: 'system-settings-public-channels', icon: 'tabler-share', titleKey: 'system-settings.system_settings.layout.tabs.organization_select' },
  { value: 'system-settings-integrations', icon: 'tabler-api', titleKey: 'system-settings.system_settings.layout.tabs.api' },
  { value: 'system-settings-notifications', icon: 'tabler-mail', titleKey: 'system-settings.system_settings.layout.tabs.notifications' },
]

export function getSystemSettingsTabs() {
  return SYSTEM_SETTINGS_TABS.map(tab => ({
    ...tab,
    title: t(tab.titleKey),
  }))
}

export function getSystemSettingsPageMeta() {
  return {
    general: {
      title: t('system-settings.system_settings.general.title'),
      subtitle: t('system-settings.system_settings.general.subtitle'),
      icon: 'tabler-settings',
      color: 'info',
      saveLabel: t('system-settings.system_settings.general.save'),
      loadErrorMessage: t('system-settings.system_settings.general.load_error'),
      saveSuccessMessage: t('system-settings.system_settings.general.save_success'),
      saveErrorMessage: t('system-settings.system_settings.general.save_error'),
      sections: [
        {
          fields: [
            { key: 'copyright', group: 'general', label: t('system-settings.system_settings.general.fields.copyright'), type: 'text', cols: 12, md: 6 },
            { key: 'designed_by', group: 'general', label: t('system-settings.system_settings.general.fields.designed_by'), type: 'text', cols: 12, md: 6 },
            {
              key: 'language',
              group: 'general',
              label: t('system-settings.system_settings.general.fields.language'),
              type: 'select',
              cols: 12,
              md: 6,
              defaultValue: 'vi',
              items: [
                { title: t('system-settings.system_settings.general.language_options.vi'), value: 'vi' },
                { title: t('system-settings.system_settings.general.language_options.en'), value: 'en' },
              ],
              transform: 'string',
            },
            {
              key: 'time_format',
              group: 'general',
              label: t('system-settings.system_settings.general.fields.time_format'),
              type: 'select',
              cols: 12,
              md: 6,
              defaultValue: 'H:i:s d/m/Y',
              items: [
                { title: t('system-settings.system_settings.general.time_format_options.full_24h'), value: 'H:i:s d/m/Y' },
                { title: t('system-settings.system_settings.general.time_format_options.short_24h'), value: 'Y-m-d H:i' },
                { title: t('system-settings.system_settings.general.time_format_options.full_12h'), value: 'h:i A d/m/Y' },
              ],
              transform: 'string',
            },
            {
              key: 'log_retention_days',
              group: 'log',
              label: t('system-settings.system_settings.general.fields.log_retention_days'),
              type: 'number',
              cols: 12,
              md: 6,
              defaultValue: 90,
              transform: 'number',
            },
          ],
        },
      ],
    },
    adminExperience: {
      title: t('system-settings.system_settings.admin_experience.title'),
      subtitle: t('system-settings.system_settings.admin_experience.subtitle'),
      icon: 'tabler-device-desktop',
      color: 'info',
      saveLabel: t('system-settings.system_settings.general.save'),
      loadErrorMessage: t('system-settings.system_settings.admin_experience.load_error'),
      saveSuccessMessage: t('system-settings.system_settings.admin_experience.save_success'),
      saveErrorMessage: t('system-settings.system_settings.admin_experience.save_error'),
      sections: [
        {
          title: t('system-settings.system_settings.admin_experience.sections.admin_page'),
          fields: [
            { key: 'admin_app_name', group: 'admin_page', label: t('system-settings.system_settings.admin_experience.fields.admin_app_name'), type: 'text', cols: 12, md: 6 },
            { key: 'admin_logo_title', group: 'admin_page', label: t('system-settings.system_settings.admin_experience.fields.admin_logo_title'), type: 'text', cols: 12, md: 6 },
            { key: 'admin_welcome_title', group: 'admin_page', label: t('system-settings.system_settings.admin_experience.fields.admin_welcome_title'), type: 'text', cols: 12, md: 6 },
            { key: 'admin_background_image', group: 'admin_page', label: t('system-settings.system_settings.admin_experience.fields.admin_background_image'), type: 'text', cols: 12, md: 6 },
            { key: 'admin_app_description', group: 'admin_page', label: t('system-settings.system_settings.admin_experience.fields.admin_app_description'), type: 'textarea', cols: 12, rows: 3 },
          ],
        },
        {
          title: t('system-settings.system_settings.admin_experience.sections.org_select_page'),
          fields: [
            { key: 'org_select_title', group: 'org_select_page', label: t('system-settings.system_settings.admin_experience.fields.org_select_title'), type: 'text', cols: 12, md: 6 },
            { key: 'org_select_background_image', group: 'org_select_page', label: t('system-settings.system_settings.admin_experience.fields.org_select_background_image'), type: 'text', cols: 12, md: 6 },
            { key: 'org_select_description', group: 'org_select_page', label: t('system-settings.system_settings.admin_experience.fields.org_select_description'), type: 'textarea', cols: 12, rows: 3 },
          ],
        },
      ],
    },
    publicChannels: {
      title: t('system-settings.system_settings.public_channels.title'),
      subtitle: t('system-settings.system_settings.public_channels.subtitle'),
      icon: 'tabler-share',
      color: 'primary',
      saveLabel: t('system-settings.system_settings.general.save'),
      loadErrorMessage: t('system-settings.system_settings.public_channels.load_error'),
      saveSuccessMessage: t('system-settings.system_settings.public_channels.save_success'),
      saveErrorMessage: t('system-settings.system_settings.public_channels.save_error'),
      sections: [
        {
          fields: [
            { key: 'social_facebook', group: 'social', label: 'Facebook', type: 'text', cols: 12, md: 6 },
            { key: 'social_twitter', group: 'social', label: 'Twitter', type: 'text', cols: 12, md: 6 },
            { key: 'social_youtube', group: 'social', label: 'YouTube', type: 'text', cols: 12, md: 6 },
            { key: 'social_tiktok', group: 'social', label: 'TikTok', type: 'text', cols: 12, md: 6 },
            { key: 'social_gmail', group: 'social', label: 'Gmail', type: 'text', cols: 12, md: 6 },
            { key: 'social_email', group: 'social', label: 'Email', type: 'text', cols: 12, md: 6 },
          ],
        },
      ],
    },
    integrations: {
      title: t('system-settings.system_settings.integrations.title'),
      subtitle: t('system-settings.system_settings.integrations.subtitle'),
      icon: 'tabler-api',
      color: 'warning',
      saveLabel: t('system-settings.system_settings.general.save'),
      loadErrorMessage: t('system-settings.system_settings.integrations.load_error'),
      saveSuccessMessage: t('system-settings.system_settings.integrations.save_success'),
      saveErrorMessage: t('system-settings.system_settings.integrations.save_error'),
      sections: [
        {
          title: 'API services',
          fields: [
            { key: 'api_gemini_url', group: 'api', label: 'Gemini API URL', type: 'text', cols: 12, md: 6 },
            { key: 'api_gemini_token', group: 'api', label: 'Gemini Token', type: 'password', cols: 12, md: 6 },
            { key: 'api_deepseek_url', group: 'api', label: 'DeepSeek API URL', type: 'text', cols: 12, md: 6 },
            { key: 'api_deepseek_token', group: 'api', label: 'DeepSeek Token', type: 'password', cols: 12, md: 6 },
            { key: 'api_chatgpt_url', group: 'api', label: 'ChatGPT API URL', type: 'text', cols: 12, md: 6 },
            { key: 'api_chatgpt_token', group: 'api', label: 'ChatGPT Token', type: 'password', cols: 12, md: 6 },
            { key: 'api_firebase_url', group: 'api', label: 'Firebase API URL', type: 'text', cols: 12, md: 6 },
            { key: 'api_firebase_token', group: 'api', label: 'Firebase Token', type: 'password', cols: 12, md: 6 },
            { key: 'api_google_maps_url', group: 'api', label: 'Google Maps API URL', type: 'text', cols: 12, md: 6 },
            { key: 'api_google_maps_token', group: 'api', label: 'Google Maps Token', type: 'password', cols: 12, md: 6 },
            { key: 'api_firebase_enabled', group: 'api', label: t('system-settings.system_settings.integrations.fields.api_firebase_enabled'), type: 'switch', cols: 12, defaultValue: false, transform: 'boolean' },
          ],
        },
        {
          title: 'SMS',
          fields: [
            { key: 'sms_server', group: 'sms', label: t('system-settings.system_settings.integrations.fields.sms_server'), type: 'text', cols: 12, md: 6 },
            { key: 'sms_username', group: 'sms', label: t('system-settings.system_settings.integrations.fields.sms_username'), type: 'text', cols: 12, md: 6 },
            { key: 'sms_password', group: 'sms', label: t('system-settings.system_settings.integrations.fields.sms_password'), type: 'password', cols: 12, md: 6 },
            { key: 'sms_test_phone', group: 'sms', label: t('system-settings.system_settings.integrations.fields.sms_test_phone'), type: 'text', cols: 12, md: 6 },
          ],
        },
        {
          title: 'Zalo',
          fields: [
            { key: 'zalo_server', group: 'zalo', label: t('system-settings.system_settings.integrations.fields.zalo_server'), type: 'text', cols: 12, md: 6 },
            { key: 'zalo_username', group: 'zalo', label: t('system-settings.system_settings.integrations.fields.zalo_username'), type: 'text', cols: 12, md: 6 },
            { key: 'zalo_password', group: 'zalo', label: t('system-settings.system_settings.integrations.fields.zalo_password'), type: 'password', cols: 12, md: 6 },
            { key: 'zalo_sender', group: 'zalo', label: t('system-settings.system_settings.integrations.fields.zalo_sender'), type: 'text', cols: 12, md: 6 },
            { key: 'zalo_template_id', group: 'zalo', label: 'Template ID', type: 'text', cols: 12, md: 6 },
            {
              key: 'zalo_extra_params',
              group: 'zalo',
              label: 'Zalo extra params (JSON)',
              type: 'textarea',
              cols: 12,
              rows: 4,
              transform: 'json',
              placeholder: '{\n  "key": "value"\n}',
            },
          ],
        },
        {
          title: 'Chat',
          fields: [
            { key: 'chat_server', group: 'chat', label: t('system-settings.system_settings.integrations.fields.chat_server'), type: 'text', cols: 12, md: 6 },
            { key: 'chat_api_key', group: 'chat', label: 'Chat API Key', type: 'password', cols: 12, md: 6 },
            { key: 'chat_sender', group: 'chat', label: t('system-settings.system_settings.integrations.fields.chat_sender'), type: 'text', cols: 12, md: 6 },
            { key: 'chat_receiver', group: 'chat', label: t('system-settings.system_settings.integrations.fields.chat_receiver'), type: 'text', cols: 12, md: 6 },
            { key: 'chat_room', group: 'chat', label: t('system-settings.system_settings.integrations.fields.chat_room'), type: 'text', cols: 12, md: 6 },
            { key: 'chat_department', group: 'chat', label: t('system-settings.system_settings.integrations.fields.chat_department'), type: 'text', cols: 12, md: 6 },
            { key: 'chat_email_title', group: 'chat', label: t('system-settings.system_settings.integrations.fields.chat_email_title'), type: 'text', cols: 12, md: 6 },
            { key: 'chat_test_type', group: 'chat', label: t('system-settings.system_settings.integrations.fields.chat_test_type'), type: 'text', cols: 12, md: 6 },
            { key: 'chat_message', group: 'chat', label: t('system-settings.system_settings.integrations.fields.chat_message'), type: 'textarea', cols: 12, rows: 3 },
          ],
        },
      ],
    },
    notifications: {
      title: t('system-settings.system_settings.notifications.title'),
      subtitle: t('system-settings.system_settings.notifications.subtitle'),
      icon: 'tabler-mail',
      color: 'primary',
      saveLabel: t('system-settings.system_settings.notifications.save'),
      loadErrorMessage: t('system-settings.system_settings.notifications.load_error'),
      saveSuccessMessage: t('system-settings.system_settings.notifications.save_success'),
      saveErrorMessage: t('system-settings.system_settings.notifications.save_error'),
      notice: t('system-settings.system_settings.notifications.info'),
      sections: [
        {
          fields: [
            {
              key: 'email_protocol',
              group: 'email',
              label: t('system-settings.system_settings.notifications.fields.email_protocol'),
              type: 'select',
              cols: 12,
              md: 6,
              defaultValue: 'smtp',
              transform: 'string',
              items: [{ title: 'SMTP', value: 'smtp' }],
            },
            { key: 'email_sender_name', group: 'email', label: t('system-settings.system_settings.notifications.fields.email_sender_name'), type: 'text', cols: 12, md: 6 },
            { key: 'email_sender_address', group: 'email', label: t('system-settings.system_settings.notifications.fields.email_sender_address'), type: 'text', cols: 12, md: 6 },
            { key: 'email_smtp_host', group: 'email', label: t('system-settings.system_settings.notifications.fields.email_smtp_host'), type: 'text', cols: 12, md: 6 },
            { key: 'email_smtp_port', group: 'email', label: t('system-settings.system_settings.notifications.fields.email_smtp_port'), type: 'number', cols: 12, md: 6, defaultValue: '587', transform: 'string' },
            { key: 'email_smtp_username', group: 'email', label: t('system-settings.system_settings.notifications.fields.email_smtp_username'), type: 'text', cols: 12, md: 6 },
            { key: 'email_smtp_password', group: 'email', label: t('system-settings.system_settings.notifications.fields.email_smtp_password'), type: 'password', cols: 12, md: 6 },
            {
              key: 'email_smtp_encryption',
              group: 'email',
              label: t('system-settings.system_settings.notifications.fields.email_smtp_encryption'),
              type: 'select',
              cols: 12,
              md: 6,
              defaultValue: 'tls',
              transform: 'string',
              items: [
                { title: 'TLS', value: 'tls' },
                { title: 'SSL', value: 'ssl' },
                { title: t('system-settings.system_settings.notifications.encryption_options.none'), value: 'none' },
              ],
            },
            { key: 'email_test_address', group: 'email', label: t('system-settings.system_settings.notifications.fields.email_test_address'), type: 'text', cols: 12, md: 6 },
          ],
        },
      ],
    },
  }
}

// Backward compatibility
export const systemSettingsPageMeta = getSystemSettingsPageMeta()
