import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router: Router = Router();

router.get('/', ProductController.getAll);
router.post('/', ProductController.create);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.delete);

export default router;
