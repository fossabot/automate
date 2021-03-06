import { SessionRequest } from "../requests/RequestsMiddleware";
import {Response} from "express";
import fetch from "node-fetch";
import Logger from "../utils/Logger";

export default async function(req: SessionRequest, res: Response, next: Function) {
    const logger = new Logger("LoadUserData");
    if (req.cookies.userId) {
		try {
			const userData = await req.getUser(req.cookies.userId);
			const reqUser = await fetch("https://discordapp.com/api/users/@me", {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${userData.access_token}`
				}
			});
			if (reqUser.status != 200) {
				logger.log(`Error : ${reqUser.status} ${reqUser.statusText}`);
				res.redirect("../connect?msg=" + encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
				return;

			}
			const resUser = JSON.parse(await reqUser.text());
			req.headerData = {
				username: resUser.username,
				avatar: `${process.env.CDN_ENDPOINT}/avatars/${req.cookies.userId}/${resUser.avatar}.png?size=64`
			};
		} catch (e) {
			logger.error(e);
			res.redirect("../connect?msg=" + encodeURI("Whoops ! It seems like your connection to Discord is impossible!"));
		}
    } 
    next();
}