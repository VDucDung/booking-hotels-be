import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Injectable()
export class UploadService {
  async uploadImage(file: any): Promise<string> {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = 'data:' + file.mimetype + ';base64,' + b64;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'booking-hotels',
      use_filename: true,
    });
    return result.secure_url;
  }
  async deleteImage(imageUrl: string): Promise<void> {
    const publicId = this.getPublicIdFromUrl(imageUrl);
    await cloudinary.uploader.destroy(publicId);
  }

  private getPublicIdFromUrl(imageUrl: string): string {
    const segments = imageUrl.split('/');
    const filename = segments[segments.length - 1];
    return filename.split('.')[0];
  }
}
