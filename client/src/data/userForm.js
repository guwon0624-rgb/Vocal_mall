export const initialUserForm = {
  name: '',
  activityName: '',
  age: '',
  email: '',
  password: '',
  confirmPassword: '',
  gender: '',
  role: '',
  voiceType: '',
  goal: '',
  referralSource: '',
  agreements: {
    terms: false,
    privacy: false,
    marketing: false,
  },
}

export const userFormOptions = {
  gender: ['남성', '여성', '기타'],
  role: ['학생', '코치'],
  voiceType: ['베이스', '바리톤', '테너', '알토', '소프라노'],
  goal: ['취미', '입시', '가수'],
  referralSource: ['지인', '유튜브', '인스타', '스레드', '기타'],
}
