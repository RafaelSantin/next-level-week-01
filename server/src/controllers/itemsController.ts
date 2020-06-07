import knex from '../database/connection'
import { Request, Response } from 'express';

class itemsController {
    async index(req: Request, res: Response)  {
        const items = await knex('items').select('*');
    
        const serializedItems = items.map(item => {
            return {
                id: item.id,
                title: item.title,
                image_url: `http://192.168.15.119:3333/uploads/${item.image}`
            };
        });
    
        return res.json(serializedItems);
    }
}
//image_url: `http://localhost:3333/uploads/${item.image}`
export default itemsController