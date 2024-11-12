
import fs from 'fs';
import player from 'play-sound';

export class SpeechMiddleware {
  private apiKey: string;
  private userId: string;
  private maleVoice: string;
  private femaleVoice: string;
  private aiProvider: any;

  constructor(aiProvider: any) {
    this.apiKey = process.env.PLAYHT_AUTHORIZATION || '';
    this.userId = process.env.PLAYHT_USER_ID || '';
    this.maleVoice = process.env.PLAYHT_MALE_VOICE || '';
    this.femaleVoice = process.env.PLAYHT_FEMALE_VOICE || '';
    this.aiProvider = aiProvider;
  }

  async process(response: any): Promise<any> {

    if (typeof response === 'string') {
      await this.speakText(response);
      return `(aloud) ${response}`;
    } else if (response && typeof response === 'object' && response.content) {
      await this.speakText(response.content);
      response.content = `(aloud) ${response.content}`;
      return response;
    }
    return response;
  }

  private async speakText(text: string): Promise<void> {
    const sentences = await this.convertToSpeakableSentences(text);
    for (const sentence of sentences) {
      await this.speakSentence(sentence, 'female'); // Default to female voice
    }
  }

  private async convertToSpeakableSentences(text: string): Promise<string[]> {
    const messages: any[] = [
      {
        role: 'system',
        content: 'Convert the given text into a number of sentences meant to be spoken aloud. This means breaking the text into sentences that are easy to read and understand as well as phonetically pronouncing any difficult words, urls, or acronyms.*** Return your response as a RAW JSON ARRAY of strings. ***',
      },
      {
        role: 'user',
        content: text + '\n\n*** Return your response as a RAW JSON ARRAY of strings with NO SURROUNDING CODE BLOCKS. ***',
      },
    ];

    const response = await this.aiProvider.chat(messages, {});
    let sentences: string[];

    try {
      sentences = JSON.parse(response.content);
      if (!Array.isArray(sentences)) {
        throw new Error('Parsed content is not an array');
      }
    } catch (error) {
      console.error('Failed to parse sentences:', error);
      sentences = [response.content]; // Fallback to using the entire content as a single sentence
    }

    return sentences;
  }

  private getNonce(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private async speakSentence(sentence: string, voice: 'male' | 'female'): Promise<void> {
    if (!sentence) return;

    const PlayHT = await import ('playht');

    PlayHT.init({
      apiKey: this.apiKey,
      userId: this.userId,
    });
    
    const stream = await PlayHT.stream(sentence, {
      voiceEngine: 'PlayHT2.0-turbo',
      voiceId: voice === 'male' ? this.maleVoice : this.femaleVoice,
    });

    const chunks: any[] = [];
    stream.on('data', (chunk: any) => chunks.push(chunk));

    return new Promise((resolve, reject) => {
      stream.on('end', () => {
        const buf = Buffer.concat(chunks);
        const filename = `${this.getNonce()}.mp3`;
        fs.writeFileSync(filename, buf);
        player().play(filename, (err: any) => {
          fs.unlinkSync(filename);
          if (err) resolve(err);
          else resolve();
        });
      });
    });
  }
}