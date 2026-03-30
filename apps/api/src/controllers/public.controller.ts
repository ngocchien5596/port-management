import { Request, Response } from 'express';
import { VoyageService } from '../services/voyage.service';

export class PublicController {
    static async getVoyageStatus(req: Request, res: Response) {
        try {
            const { voyageCode, phone } = req.query;

            if (!voyageCode || !phone) {
                return res.status(400).json({ message: 'Số hiệu tàu và Số điện thoại là bắt buộc' });
            }

            const code = parseInt(voyageCode as string, 10);
            if (isNaN(code)) {
                return res.status(400).json({ message: 'Số hiệu tàu không hợp lệ' });
            }

            const status = await VoyageService.getPublicTracking(code, phone as string);

            if (!status) {
                return res.status(404).json({ message: 'Không tìm thấy thông tin chuyến tàu với mã số và số điện thoại cung cấp' });
            }

            res.json(status);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
