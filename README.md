# Mrply
음악 순위를 통해 추천받는 음악 스트리밍 프로젝트  
👉 [Mrply 프로젝트 상세 노션 바로가기](https://giup.notion.site/MrPly-2275de3867b18008a000cacda4f07c3d?source=copy_link)

### 트러블슈팅: 유튜브 음원 추출 API의 한계
- ytdl-core를 활용해 유튜브에서 오디오 스트림을 추출하는 API를 AWS EC2에 배포했으나,
  - 유튜브 측의 봇 감지/비정상 트래픽 차단 정책으로 인해 실제 서비스 환경에서는 재생이 정상적으로 동작하지 않음
  - (로컬 개발 환경에서는 정상적으로 동작)
- 임시로 localhost에서만 API를 사용하여 개발 및 테스트 진행

## 프로젝트 폴더/파일 구조
- [`App.tsx`](./App.tsx)
- [`navigator/`](./navigator/)
  - [`Routes.tsx`](./navigator/Routes.tsx)
- [`network/`](./network/)
  - [`network.ts`](./network/network.ts)
- [`asset/`](./asset/)
  - [`color/`](./asset/color/)
    - [`color.ts/`](./asset/color/color.ts)
  - [`images/`](./asset/images/)
- [`component/`](./component/)
  - [`common/`](./component/common/)
    - [`Header.tsx`](./component/common/Header.tsx)
    - [`PlayingMusicBar.tsx`](./component/common/PlayingMusicBar.tsx)
  - [`modal/`](./component/modal/)
    - [`ListModal.tsx`](./component/modal/ListModal.tsx)
    - [`SearchMusicModal.tsx`](./component/modal/SearchMusicModal.tsx)
    - [`TextInputModal.tsx`](./component/modal/TextInputModal.tsx)
- [`model/`](./model/)
  - [`model.ts`](./model/model.ts)
- [`screen/`](./screen/)
  - [`common/`](./screen/common/)
    - [`PlayingMusicScreen.tsx`](./screen/common/PlayingMusicScreen.tsx)
  - [`home/`](./screen/home/)
    - [`HomeScreen.tsx`](./screen/home/HomeScreen.tsx)
  - [`musicWorldCup/`](./screen/musicWorldCup/)
    - [`MusicWorldCupScreen.tsx`](./screen/musicWorldCup/MusicWorldCupScreen.tsx)
  - [`playlist/`](./screen/playlist/)
    - [`PlaylistDetailScreen.tsx`](./screen/playlist/PlaylistDetailScreen.tsx)
    - [`PlaylistScreen.tsx`](./screen/playlist/PlaylistScreen.tsx)
  - [`search/`](./screen/search/)
    - [`SearchScreen.tsx`](./screen/search/SearchScreen.tsx)
- [`store/`](./store/)
  - [`index.ts`](./store/index.ts)
  - [`rootReducer.ts`](./store/rootReducer.ts)
  - [`slices/`](./store/slices/)
    - [`playlistSlice.ts`](./store/slices/playlistSlice.ts)
    - [`playMusicSlice.ts`](./store/slices/playMusicSlice.ts)
    - [`recentSearchSlice.ts`](./store/slices/recentSearchSlice.ts)
- [`service/`](./service/)
  - [`musicService.ts`](./service/musicService.ts)
- [`contexts/`](./contexts/)
  - [`PlayingMusicBarHeightContext.tsx`](./contexts/PlayingMusicBarHeightContext.tsx)
- [`utils/`](./utils/)
  - [`formatHelpers.ts`](./utils/formatHelpers.ts)
  - [`validateAudioUrl.ts`](./utils/validateAudioUrl.ts)
- env
- env_types.d.ts
