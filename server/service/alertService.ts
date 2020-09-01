import * as alertDao from '../dao/alertDao';
import * as modal from '../modal';
import _ from 'lodash';
import { Request, Response } from 'express';

const path = new Map();

const insertAlert = (alert: modal.alert, callback: Function) => {
    alertDao.insertAlert(alert, callback);
}

//标为已读通知
const readAlert = (request: Request, response: Response) => {
    const { alert_id = [] } = request.query;
    if (alert_id && alert_id.length === 0) {
        response.send('success');
        return;
    }
    alert_id && alert_id.forEach((id: string, index: number) => {
        alertDao.updateAlert('is_look', id, true, () => {
            if (index === alert_id.length - 1) {
                response.send('success');
            }
        });
    })

}

const getAllAlert = (request: Request, response: Response) => {
    const { user_id } = request.query;
    alertDao.findAll(user_id, (alerts: any[]) => {
        response.json({
            alertList: _.orderBy(alerts,['time'],'desc')
        })
    })
}

const queryBeforeReadAlert = (request: Request, response: Response) => {
    const { user_id } = request.query;
    alertDao.findAll(user_id, (alerts: any[]) => {
        const alertList = _.filter(alerts, (item: modal.alert) => item.is_look === false);
        response.json({
            alertList
        })
    })
}

path.set('insertAlert', insertAlert);
path.set('/api/getAllAlert', getAllAlert);
path.set('/api/queryBeforeReadAlert', queryBeforeReadAlert);
path.set('/api/readAlert', readAlert);

export default path;