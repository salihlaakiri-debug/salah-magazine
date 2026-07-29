import { Noto_Naskh_Arabic, Noto_Kufi_Arabic } from 'next/font/google'

export const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-arabic',
  display: 'swap',
  preload: true,
})

export const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-heading',
  display: 'swap',
  preload: true,
})
