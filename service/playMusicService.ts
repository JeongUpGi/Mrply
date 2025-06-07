import TrackPlayer from 'react-native-track-player';
import {getAudioUrlAndData} from '../network/network'; // network.ts에서 가져옵니다.
import {SearchResultMusicItem} from '../model/model'; // SearchResultMusicItem 타입 임포트

/**
 * 음악 재생을 시작하는 서비스 함수 (백엔드와 통신한 오디오 파일을 통해 track을 play하는 서비스 함수)
 * @param item
 */
export async function playMusicService(
  item: SearchResultMusicItem,
): Promise<void> {
  const videoId = item.id.videoId;

  if (!videoId) {
    throw new Error('No videoId found for this item.');
  }

  console.log('Attempting to start playback for video ID:', videoId);

  try {
    const {audioPlaybackData} = await getAudioUrlAndData(item);

    // await TrackPlayer.reset(); // 이 부분은 주석 처리된 상태로 유지합니다.
    await TrackPlayer.add(audioPlaybackData);
    await TrackPlayer.play();
  } catch (err: unknown) {
    console.error('Error in playbackService (startPlayback):', err);
    if (err instanceof Error) {
      throw new Error('Failed to start playback: ' + err.message);
    } else {
      throw new Error('Unknown error in playbackService.');
    }
  }
}
