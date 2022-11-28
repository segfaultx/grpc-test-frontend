import {Component, OnInit} from '@angular/core';
import {IMessage, Client} from "@stomp/stompjs";
import {HttpClient} from "@angular/common/http";


interface StocksUpdate {
  stockName: string;
  stockValue: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'WebsocketTest';
  stockInput = "";
  stocks = new Map<String, number>();

  constructor(private httpClient: HttpClient) {
  }

  ngOnInit(): void {
    void this.fetchUpdateData();
  }


  fetchUpdateData(): void {
    this.stocks.set("MSCI", 0);
    this.stocks.set("Apple", 0);
    this.stocks.set("DAX", 0);
    this.stocks.set("Netflix", 0);
    this.stocks.set("Tesla", 0);

    let client = new Client({
      brokerURL: "ws://localhost:15674/ws",
      connectHeaders: {
        login: "guest",
        passcode: "guest"
      }
    });

    let on_connect = (stocks: Map<String, number>): () => void => {
      return () => {
        client.subscribe('/queue/stocks', function(d: IMessage) {
          let p: StocksUpdate = JSON.parse(d.body);
          stocks.set(p.stockName, p.stockValue);
        });
      }
    };
    let on_error = () => {
      console.log('error');
    };

    client.onConnect = on_connect(this.stocks);
    client.onWebSocketError = on_error;
    client.activate();
  }

  addDataToFetch() {
    this.httpClient.post("http://localhost:8080/api/stocks/" + this.stockInput, {}).subscribe();
    this.stocks.set(this.stockInput, 0);
    this.stockInput = "";
  }
}
