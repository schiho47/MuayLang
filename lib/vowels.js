// 基礎母音 (單母音) - 長短成對
export const basicVowels = [
  {
    pairId: 'a',
    short: { id: 'v_a_s', char: '◌ะ', closed: '◌ั◌', roman: 'a' },
    long: { id: 'v_a_l', char: 'า', closed: 'า', roman: 'a:' },
  },
  {
    pairId: 'i',
    short: { id: 'v_i_s', char: 'ิ', closed: 'ิ', roman: 'i' },
    long: { id: 'v_i_l', char: 'ี', closed: 'ี', roman: 'i:' },
  },
  {
    pairId: 'u',
    short: { id: 'v_u_s', char: 'ุ', closed: 'ุ', roman: 'u' },
    long: { id: 'v_u_l', char: 'ู', closed: 'ู', roman: 'u:' },
  },
  {
    pairId: 'ue',
    short: { id: 'v_ue_s', char: 'ึ', closed: 'ึ', roman: 'ue' },
    long: { id: 'v_ue_l', char: 'ือ', closed: 'ื◌', roman: 'ue:' },
  },
]

// 複合母音
export const complexVowels = [
  {
    pairId: 'e',
    short: { id: 'v_e_s', char: 'เอะ', closed: 'เ◌็◌', roman: 'e' },
    long: { id: 'v_e_l', char: 'เ', closed: 'เ', roman: 'e:' },
  },
  {
    pairId: 'ae',
    short: { id: 'v_ae_s', char: 'แอะ', closed: 'แ◌็◌', roman: 'ae' },
    long: { id: 'v_ae_l', char: 'แ', closed: 'แ', roman: 'ae:' },
  },
  {
    pairId: 'o',
    short: { id: 'v_o_s', char: 'โอะ', closed: '◌', roman: 'o' },
    long: { id: 'v_o_l', char: 'โ', closed: 'โ', roman: 'o:' },
  },
  {
    pairId: 'oe',
    short: {
      id: 'v_oe_s',
      char: 'เอาะ',
      closed: 'เออะ', // 雖然少見，但對應截圖中的短音形式
      roman: 'ə',
      note: 'Short oe',
    },
    long: {
      id: 'v_oe_l',
      char: 'เออ',
      closed: 'เ◌ิ◌', // 一般尾音時的變形 (如: เดิน)
      specialClosed: {
        ending: 'ย',
        form: 'เอย', // 當尾音是 ย 時，上面的 ิ 會消失 (如: เคย)
      },
      roman: 'ə:',
      note: 'Long oee',
    },
  },
]

// 雙母音 (Diphthongs)
export const diphthongs = [
  {
    pairId: 'ia',
    short: { id: 'v_ia_s', char: 'เอียะ', closed: 'เอียะ', roman: 'ia' },
    long: { id: 'v_ia_l', char: 'เอีย', closed: 'เอีย', roman: 'ia:' },
  },
  {
    pairId: 'ua',
    short: { id: 'v_ua_s', char: 'อัวะ', closed: 'อัวะ', roman: 'ua' },
    long: { id: 'v_ua_l', char: 'อัว', closed: '◌ว◌', roman: 'ua:' },
  },
]

// Special Vowels / Finals
export const specialVowels = [
  {
    pairId: 'am',
    short: {
      id: 'v_am_s',
      char: 'อำ', // Sara Am
      closed: 'อำ',
      roman: 'am',
    },
    // 此類母音通常無長音對應，保持為 null 或不定義
    long: null,
  },
  {
    pairId: 'ay_malay',
    short: {
      id: 'v_ay_m_s',
      char: 'ไอ', // May Malay
      closed: 'ไอ',
      roman: 'ay',
    },
    long: null,
  },
  {
    pairId: 'ay_muan',
    short: {
      id: 'v_ay_n_s',
      char: 'ใอ', // May Muan
      closed: 'ใอ',
      roman: 'ay',
    },
    long: null,
  },
  {
    pairId: 'au',
    short: {
      id: 'v_au_s',
      char: 'เอา', // Sara Au (妳提到的 เ-าะ 變體，這是長音版或自成一類)
      closed: 'เ◌า',
      roman: 'au',
    },
    long: null,
  },
]
