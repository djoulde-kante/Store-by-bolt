const { contextBridge, ipcRenderer } = require('electron');
const Store = require('electron-store');

const store = new Store();

contextBridge.exposeInMainWorld('electron', {
  getProducts: () => ipcRenderer.invoke('get-products'),
  addProduct: (product) => ipcRenderer.invoke('add-product', product),
  updateProduct: (id, updates) => ipcRenderer.invoke('update-product', id, updates),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
  getSales: () => ipcRenderer.invoke('get-sales'),
  addSale: (sale) => ipcRenderer.invoke('add-sale', sale),
  printReceipt: (content) => ipcRenderer.invoke('print-receipt', content),
});