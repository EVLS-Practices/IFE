import { $, createElement, generateId } from "../util.js";

export class DataCenter {
  init () {
    this.radioReceiver.onReceive(({ senderId, content: { status, energyPercentage } }) => {
      this.updateRow(senderId, status, energyPercentage);
    });
  }

  updateRow (id, status, energyPercentage) {
    if (!this.elementMap[ id ]) {
      this.elementMap[ id ] = createElement(null, "tr");
      this.container.appendChild(this.elementMap[ id ]);
    }
    this.elementMap[ id ].innerHTML = `
<td>Id: ${ id }</td>
<td>Status: ${ status }</td>
<td>Energy: ${ energyPercentage }%</td>
`;
  }

  constructor (container, radioReceiverFactory) {
    this.id            = generateId();
    this.container     = container;
    this.elementMap    = {};
    this.radioReceiver = radioReceiverFactory(this.id);

    this.init();
  }
}
