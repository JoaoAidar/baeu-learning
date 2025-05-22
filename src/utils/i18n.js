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
      },
      lessons: {
        title: 'Korean Lessons',
        searchPlaceholder: 'Search lessons...',
        filter: 'Filter',
        loading: 'Loading lessons...',
        error: 'Failed to load lessons. Please try again.',
        start: 'Start',
        continue: 'Continue',
        difficulty: {
          beginner: 'Beginner',
          intermediate: 'Intermediate',
          advanced: 'Advanced'
        }
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
      },
      lessons: {
        title: 'Lições de Coreano',
        searchPlaceholder: 'Buscar lições...',
        filter: 'Filtrar',
        loading: 'Carregando lições...',
        error: 'Falha ao carregar lições. Por favor, tente novamente.',
        start: 'Começar',
        continue: 'Continuar',
        difficulty: {
          beginner: 'Iniciante',
          intermediate: 'Intermediário',
          advanced: 'Avançado'
        }
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
      },
      lessons: {
        title: '한국어 수업',
        searchPlaceholder: '수업 검색...',
        filter: '필터',
        loading: '수업을 불러오는 중...',
        error: '수업을 불러오는데 실패했습니다. 다시 시도해주세요.',
        start: '시작하기',
        continue: '계속하기',
        difficulty: {
          beginner: '초급',
          intermediate: '중급',
          advanced: '고급'
        }
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