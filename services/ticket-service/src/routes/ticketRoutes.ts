import { Router } from 'express';
import * as TicketController from '../controllers/ticketController';

const router = Router();

router.post('/', TicketController.createTicket);
router.get('/:id', TicketController.getTicketById);
router.get('/user/:userId', TicketController.getTicketsByUser);
router.get('/route/:routeId', TicketController.getTicketsByRoute);
router.delete('/:id', TicketController.deleteTicket);

export default router;
    