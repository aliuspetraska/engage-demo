/**
 * (C) Copyright IBM Corp. 2021.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 */
import compression from 'compression';
import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import http from 'http';
import nocache from 'nocache';

const app = express();

app.enable('strict routing');
app.enable('trust proxy');

app.use(cors());
app.use(helmet({ frameguard: false, contentSecurityPolicy: false }));
app.use(compression());
app.use(nocache());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/post', (req: Request, res: Response) => {
  const { body } = req;
  console.log(body);

  return res.status(200).json({ status: 'ok' });
});

app.use('/get', (req: Request, res: Response) => {
  setTimeout(() => {
    return res.status(200).json({ message: 'test' });
  }, 10000);
});

// default
app.use('/', (req: Request, res: Response) => {
  return res.status(200).json({ status: 'Works!' });
});

http.createServer(app).listen(process.env.PORT || 3000, () => {
  console.info('Middleware Initialized.');
});
