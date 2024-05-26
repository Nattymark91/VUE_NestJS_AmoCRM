import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { ConfigService } from '@nestjs/config';

interface LeadsResponse {
  _embedded: any;
}

interface ContactsResponse {
  name: string;
  custom_fields_values: any[]
}

@Injectable()
export class LeadsService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async findAll(query?: string): Promise<any> {
    const token = this.configService.get<string>('TOKEN');
    const user = this.configService.get<string>('USER');
    const url = `https://${user}.amocrm.ru/api/v4`;
    query && query.length > 2 ? query : (query = '');

    const data = await firstValueFrom(
      this.httpService
        .get<LeadsResponse>(`${url}/leads?with=contacts&query=${query}`, {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        })
        .pipe(
          map((res) => res.data),
          catchError((error) => {
            throw `ERROR - ${error}`;
          }),
        ),
    );

    const leadPromises = data._embedded.leads.map(async (lead: any) => {
      const responsible = async () => {
        return await firstValueFrom(
          this.httpService
            .get<any>(`${url}/users/${lead.responsible_user_id}`, {
              headers: {
                Authorization: 'Bearer ' + token,
              },
            })
            .pipe(map((res) => res.data.name)),
        );
      };

      const statuse = async () => {
        return await firstValueFrom(
          this.httpService
            .get<any>(
              `${url}/leads/pipelines/${lead.pipeline_id}/statuses/${lead.status_id}`,
              {
                headers: {
                  Authorization: 'Bearer ' + token,
                },
              },
            )
            .pipe(map((res) => res.data.name)),
        );
      };

      const date = new Date(lead.created_at * 1000);
      const formattedDate = `${('0' + date.getDate()).slice(-2)}.${('0' + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;

      const contacts = async () => {
        return await firstValueFrom(
          this.httpService
            .get<ContactsResponse>(
              `${url}/contacts/${lead._embedded.contacts[0].id}`,
              {
                headers: {
                  Authorization: 'Bearer ' + token,
                },
              },
            )
            .pipe(map((res) => res.data)),
        );
      };
      const contact = await contacts();

      return {
        title: lead.name,
        budget: lead.price,
        status: await statuse(),
        responsible: await responsible(),
        date: formattedDate,
        contacts: {
          name: contact.name,
          phone: contact.custom_fields_values[0].values[0].value,
          email: contact.custom_fields_values[1].values[0].value,
        },
      };
    });
    return Promise.all(leadPromises);
  }
}
