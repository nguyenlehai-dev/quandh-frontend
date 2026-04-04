import { createMeetingsNavigationGroup, createMeetingsNavigationItem } from '../shared/moduleFactory'

export const navigation = createMeetingsNavigationGroup({
  titleKey: 'navigation.navigation.meetings.title',
  icon: 'tabler-calendar-event',
  children: [
    createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.meetings_list', to: 'meetings-list' }),
    createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.my_calendar', to: 'meetings-participant-my-meetings' }),
    createMeetingsNavigationGroup({
      titleKey: 'navigation.navigation.meetings.categories',
      icon: 'tabler-folders',
      children: [
        createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.attendee_groups', to: 'meetings-attendee-groups' }),
        createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.document_types', to: 'meetings-document-types' }),
        createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.document_fields', to: 'meetings-document-fields' }),
        createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.meeting_types', to: 'meetings-meeting-types' }),
      ],
    }),
  ],
})
