import knex from '../database/connection'
import { Request, Response, response } from 'express';

class pointsController {
    async create(req: Request, res: Response) {
        const {         
            name,
            email,
            whatsapp,
            latitude,
            longetude,        
            city,
            uf,
            number,
            items
        } = req.body;
    
        const trx = await knex.transaction();
    
        const insertedIds = await trx('points').insert({            
            image: req.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longetude,
            city,
            uf,
            number,
        });
    
    
        const pointId = insertedIds[0]

        const pointItems = items
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map((item_id: number) => {
            return {
                item_id,
                point_id: pointId
            }
        })
    
        await trx('point_items').insert(pointItems).then(trx.commit)
        .catch(trx.rollback);
    
        return res.json({success: true})
    }

    async show (req: Request, res:Response){
        const { id } = req.params;

        const point = await knex('points').join('point_items','point_items.point_id','=','points.id').where('points. id', id).first('*');

        if (!point){
            return res.status(400).json({message: 'Point not found'});
        }

        const serializedPoints = {
            ...point,
            image_url: `http://192.168.15.119:3333/uploads/${point.image}`
        };

        const items = await knex('items')
            .join('point_items','point_items.item_id','=','items.id')
            .where('point_items.point_id', id);

        return res.json({serializedPoints,items});
    }

    async index (req:Request, res:Response){
        const { uf, city, items } = req.query;

        console.log(uf,city);

        const parsedItems = String(items).split(',').map(item => Number(item.trim()));

        const points = await knex('points')
            .join('point_items','points.id','=','point_items.point_id')
            .where('points.uf', String(uf))
            .where('points.city', String(city))
            .whereIn('point_items.item_id',parsedItems)
            .distinct()
            .select("points.*");

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.15.119:3333/uploads/${point.image}`
            };
        });
        return res.json(serializedPoints)
    }
}

export default pointsController