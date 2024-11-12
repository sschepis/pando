import { Config } from "../../../../ai/types";

export const generateImage: Config['tools'][0] = {
    type: 'function',
    function: {
        name: 'generateImage',
        description: 'Generate an image based on the provided prompt using DALL-E',
        parameters: {
            type: 'object',
            properties: {
                prompt: { type: 'string', description: 'The image generation prompt' },
                size: { type: 'string', description: 'The size of the generated image (256x256, 512x512, or 1024x1024)' },
                n: { type: 'number', description: 'The number of images to generate' }
            },
            required: ['prompt']
        },
        script: async (parameters: any, context: any) => {
            try {
                const response = await context.generateImage({
                    prompt: parameters.prompt,
                    n: parameters.n || 1,
                    size: parameters.size || '1024x1024'
                });

                return {
                    success: true,
                    images: response.data.map((img: any) => img.url)
                };
            } catch (error) {
                console.error('Error generating image:', error);
                return {
                    success: false,
                    error: 'Failed to generate image'
                };
            }
        }
    }
};
