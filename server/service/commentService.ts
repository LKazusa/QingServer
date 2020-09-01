import * as commentDao from '../dao/commentsDao';
import _ from 'lodash';
import { Request, Response } from 'express';
const qs = require('qs');

const path = new Map();

const addComment = (request: any, response: any) => {
    const comment = qs.parse(request.body);

    commentDao.insertOneComment(comment, (err: any, result: any) => {
        if (!err) {
            response.send({ message: 'ok' });
        }
    })
}
export const findComments = (dynamic_id: string, callback: Function) => {
    commentDao.findCommentsByDynamicId(dynamic_id.toString(), (res: any[]) => {
        if (res) {
            if (res.length === 0) {
                callback(undefined);
            } else {
                callback(_.orderBy(res, ['time'], ['desc']));
            }
        }else{
            callback([])
        }
    })
}

const findCommentsByDynamicId = (request: Request, response: Response) => {
    const { dynamic_id } = request.query;
    findComments(dynamic_id, (list: any) => {
        response.json({
            list
        });
    });
};

path.set('/api/addComment', addComment);
path.set('/api/findComments', findCommentsByDynamicId);

export default path;