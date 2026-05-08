import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        lessons: 'Lessons',
        admin: 'Admin',
        login: 'Login',
        signup: 'Sign Up',
        logout: 'Logout',
        profile: 'Profile'
      }
    }
  },
  pt: {
    translation: {
      nav: {
        lessons: 'Lições',
        admin: 'Admin',
        login: 'Entrar',
        signup: 'Cadastrar',
        logout: 'Sair',
        profile: 'Perfil'
      }
    }
  },
  ko: {
    translation: {
      nav: {
        lessons: '수업',
        admin: '관리자',
        login: '로그인',
        signup: '회원가입',
        logout: '로그아웃',
        profile: '프로필'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 