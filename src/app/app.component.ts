import {Component, OnInit} from '@angular/core';
import {IMessage, Client} from "@stomp/stompjs";


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
  stocks = new Map<String, number>();

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
}
