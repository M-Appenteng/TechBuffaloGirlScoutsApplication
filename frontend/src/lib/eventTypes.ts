export interface EventTypeInfo {
  value: string;
  label: string;
  description: string;
}

export const EVENT_TYPES: EventTypeInfo[] = [
  {
    value: 'Recruitment Table',
    label: 'Recruitment Table',
    description: "Set up a table during school pickup or dropoff and talk with interested families about joining a troop. About an hour, no prep needed.",
  },
  {
    value: 'Info Session',
    label: 'Info Session',
    description: 'Give a short presentation to parents about what Girl Scouts offers and how to sign up. Staff provides the materials — you just present.',
  },
  {
    value: 'Community Fair Booth',
    label: 'Community Fair Booth',
    description: 'Staff a booth at a school or community fair alongside other local organizations. Casual, walk-up conversations rather than a presentation.',
  },
  {
    value: 'Classroom Visit',
    label: 'Classroom Visit',
    description: 'Visit a classroom together with a staff member to introduce Girl Scouts directly to students. Usually 20-30 minutes.',
  },
  {
    value: 'Parent Info Night',
    label: 'Parent Info Night',
    description: 'Join an evening info session for parents, answering questions one-on-one after a short staff presentation.',
  },
];
