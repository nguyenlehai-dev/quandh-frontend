import { createMeetingsNavigationGroup, createMeetingsNavigationItem } from '../shared/moduleFactory'

export const navigation = createMeetingsNavigationGroup({
  titleKey: 'navigation.navigation.meetings.title',
  icon: 'tabler-calendar-event',
  children: [
    createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.meetings_list', to: 'meetings-list', action: 'index', subject: 'Meeting' }),
    createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.my_calendar', to: 'meetings-participant-my-meetings', action: 'index', subject: 'MyMeeting' }),
    createMeetingsNavigationGroup({
      titleKey: 'navigation.navigation.meetings.categories',
      icon: 'tabler-folders',
      children: [
        createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.attendee_groups', to: 'meetings-attendee-groups', action: 'index', subject: 'AttendeeGroup' }),
        createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.document_types', to: 'meetings-document-types', action: 'index', subject: 'MeetingDocumentType' }),
        createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.document_fields', to: 'meetings-document-fields', action: 'index', subject: 'MeetingDocumentField' }),
        createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.meeting_types', to: 'meetings-meeting-types', action: 'index', subject: 'MeetingType' }),
      ],
    }),
  ],
})
