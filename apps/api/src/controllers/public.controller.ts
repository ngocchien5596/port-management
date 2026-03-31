import { Request, Response } from 'express';
import { VoyageService } from '../services/voyage.service';

export class PublicController {
    static async searchVoyage(req: Request, res: Response) {
        try {
            const { voyageCode, phone } = req.query;

            if (!voyageCode || !phone) {
                return res.status(400).json({ message: 'Số hiệu tàu và Số điện thoại là bắt buộc' });
            }

            const code = parseInt(voyageCode as string, 10);
            if (isNaN(code)) {
                return res.status(400).json({ message: 'Số hiệu tàu không hợp lệ' });
            }

            const status = await VoyageService.getPublicTracking({ voyageCode: code, phone: phone as string });

            if (!status) {
                return res.status(404).json({ message: 'Không tìm thấy thông tin chuyến tàu với mã số và số điện thoại cung cấp' });
            }

            res.json(status);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getVoyageDetail(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { phone } = req.query;

            if (!id || !phone) {
                return res.status(400).json({ message: 'ID chuyến và Số điện thoại là bắt buộc' });
            }

            const status = await VoyageService.getPublicTracking({ voyageId: id, phone: phone as string });

            if (!status) {
                return res.status(404).json({ message: 'Không tìm thấy thông tin chuyến tàu' });
            }

            res.json(status);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
