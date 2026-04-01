import { createMeetingsNavigationGroup, createMeetingsNavigationItem } from '../shared/moduleFactory'

export const navigation = createMeetingsNavigationGroup({
  titleKey: 'navigation.navigation.meetings.title',
  icon: 'tabler-calendar-event',
  children: [
    createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.my_calendar', to: 'meetings-my-calendar' }),
    createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.meetings_list', to: 'meetings-list' }),
    createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.votes_list', to: 'meetings-votes-list' }),
    createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.documents_list', to: 'meetings-documents-list', subject: 'Meeting' }),
    createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.conclusions_list', to: 'meetings-conclusions-list' }),
    createMeetingsNavigationGroup({
      titleKey: 'navigation.navigation.meetings.categories',
      icon: 'tabler-folders',
      children: [
        createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.attendees', to: 'meetings-attendees-list', subject: 'MeetingParticipant' }),
        createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.attendee_groups', to: 'meetings-attendee-groups', subject: 'AttendeeGroup' }),
        createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.document_types', to: 'meetings-document-types', subject: 'DocumentType' }),
        createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.document_fields', to: 'meetings-document-fields', subject: 'DocumentField' }),
        createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.document_signers', to: 'meetings-document-signers', subject: 'DocumentSigner' }),
        createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.issuing_agencies', to: 'meetings-issuing-agencies', subject: 'IssuingAgency' }),
        createMeetingsNavigationItem({ titleKey: 'navigation.navigation.meetings.meeting_types', to: 'meetings-meeting-types', subject: 'MeetingType' }),
      ],
    }),
  ],
})
