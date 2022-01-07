<template>
  <div id="app">
    <header class="">
      <nav class="navbar navbar-expand-lg">
        <div class="container">
          <a href="/" class="navbar-brand-text">
            <img class="logo" src="@/assets/logo.png" alt="" />
          </a>
          <template v-if="getUserAccount">
            <button class="btn btn-primary btn-connect" :disabled="true">
              {{ addrTruncation(getUserAccount) }}
            </button>
          </template>
          <button v-else class="btn btn-primary btn-connect" @click="onConnect">
            Connect Wallet
          </button>
        </div>
      </nav>
    </header>
    <div>
      <div class="d-flex justify-content-center">
        <h1 class="mb-5">$AKITAX Token Sale</h1>
      </div>
      <div class="d-column d-md-flex justify-content-center">
        <div class="card">
          <div>
            <h1 class="mb-5">Welcome to AKITAVAX</h1>
            <p class="text-justify">
              AKITAVAX IS A COMMUNITY DRIVEN MEME BASED CRYPTOCURRENCY PROJECT
              THAT TAKES DIFFERENT APPROACH ON TECHNOLOGIES SERVED FROM OTHER
              MEME COINS.
              
            </p>
          </div>
        </div>
        <div class="card white">
          <div>
            <div class="box">
              <strong>Min: $100 - Max: $50.000</strong>
            </div>
            <div>
              <div class="form-group">
                <label for="inputState">State</label>
                <select id="inputState" class="form-control" v-model="selected">
                  <option :value="null" selected disabled>
                    Select Stablecoins
                  </option>
                  <option value="0">USDT (Avalanche C-Chain)</option>
                  <option value="1">USDC (Avalanche C-Chain)</option>
                  <option value="2">USDT (ERC-20)</option>
                  <option value="3">BUSD (BEP-20)</option>
                </select>
              </div>
              <div class="form-group">
                <input class="form-control" type="number" v-model="amount" />
              </div>
            </div>
            <div>
              <template v-if="getUserAccount">
                <button
                  class="btn btn-primary btn-connect"
                  @click="onDeposit"
                  :disabled="loading"
                >
                  {{ loading ? "Confirming..." : "BUY" }}
                </button>
              </template>
              <button
                v-else
                class="btn btn-primary btn-connect"
                @click="onConnect"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Web3 from "web3";
import Web3Modal from "web3modal";
import contract from "./contracts/ABIs.json";

import { mapActions, mapGetters } from "vuex";

export default {
  name: "App",
  data() {
    return {
      provider: null,
      chainId: null,
      selected: null,
      amount: 0,
      balance: 0,
      totalCollected: 0,
      web3Modal: "",
      loading: false,
      contractABI: null,
      contractAddr: null,
      ownerAddr: "0x4E6729D81C85a388a011b420e148D598597D6426",
      contractsArray: [
        "0xc7198437980c041c805a1edcba50c1ce5db95118",
        "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
        "0xdac17f958d2ee523a2206206994597c13d831ec7",
        "0xe9e7cea3dedca5984780bafc599bd69add087d56",
      ],
    };
  },
  beforeMount() {
    this.web3Modal = new Web3Modal({
      cacheProvider: false,
      disableInjectedProvider: false,
    });
  },
  mounted() {},
  methods: {
    ...mapActions("wallet", ["SET_WEB3", "SET_USER_ACCOUNT"]),
    addrTruncation(addr) {
      return addr.slice(0, 6) + "…" + addr.slice(addr.length - 4, addr.length);
    },
    disconnect() {
      this.SET_WEB3(null);
      this.SET_USER_ACCOUNT(null);
    },
    async onConnect() {
      try {
        if (window.ethereum) {
          let provider = await this.web3Modal.connect();
          this.onProvider(provider);
          window.ethereum.on("accountsChanged", () => {
            this.onProvider(window.ethereum);
          });
          window.ethereum.on("chainChanged", () => {
            this.onProvider(window.ethereum);
          });
        } else {
          this.$toasted.show("Install Metamask Wallet!");
        }
      } catch (e) {
        console.log("Could not get a wallet connection", e);
        return;
      }
    },
    async onProvider(provider) {
      this.provider = provider;
      try {
        let web3 = new Web3(provider);
        this.SET_WEB3(web3);

        let accounts = await web3.eth.getAccounts();
        this.chainId = await web3.eth.getChainId();
        if (accounts.length) {
          if (!this.getUserAccount)
            this.$toasted.show("Wallet Connected Successfully");
          this.SET_USER_ACCOUNT(accounts[0]);
        }
      } catch (e) {
        console.log("Could not get a wallet connection", e);
        return;
      }
    },
    async onDeposit() {
      if (!this.selected) {
        this.$toasted.show("Please select a Stablecoin first");
        return;
      } else if (Number(this.amount) < 100) {
        this.$toasted.show("Minimum limit is 100 USD");
        return;
      } else if (Number(this.amount) > 50000) {
        this.$toasted.show("Maximum limit is 50.000 USD");
        return;
      } else if (this.selected == "0" || this.selected == "1") {
        if (this.chainId != 43114) {
          this.$toasted.show("Wrong network, please update it!");
          setTimeout(() => {
            this.watcher();
          }, 2000);
          return;
        }
      } else if (this.selected == "2" && this.chainId != 1) {
        this.$toasted.show("Wrong network, please update it!");
        setTimeout(() => {
          this.watcher();
        }, 2000);
        return;
      } else if (this.selected == "3" && this.chainId != 56) {
        this.$toasted.show("Wrong network, please update it!");
        setTimeout(() => {
          this.watcher();
        }, 2000);
        return;
      }
      let amount;
      if (this.selected == "3") amount = this.amount * 1e18;
      else amount = this.amount * 1e6;
      this.loading = true;
      let instance = new this.getWeb3.eth.Contract(
        this.contractABI,
        this.contractAddr
      );

      let data = instance.methods
        .transfer(this.ownerAddr, amount.toString())
        .encodeABI();
      this.getWeb3.eth
        .sendTransaction({
          value: 0,
          from: this.getUserAccount,
          to: this.contractAddr,
          data: data,
        })
        .on("transactionHash", (hash) => {
          console.log("Transaction hash", hash);
          this.$toasted.show("Transaction is submitted to network!");
        })
        .on("receipt", (receipt) => {
          this.loading = false;
          this.$toasted.show("Transaction completed successfully");
          console.log("Receipt: ", receipt);
        })
        .on("error", (error) => {
          this.loading = false;
          console.log("Error receipt: ", error);
        });
    },
    humanized(number, fix) {
      return Number(
        this.getWeb3.utils.fromWei(number.toString(), "ether")
      ).toFixed(number == 0 ? 3 : fix);
    },
    async watcher() {
      switch (this.selected) {
        case "0":
          this.contractAddr = this.contractsArray[this.selected];
          this.contractABI = contract.USDTE;
          await this.provider.request({
            method: "wallet_switchEthereumChain",
            params: [
              {
                chainId: "0xA86A",
              },
            ],
          });
          break;
        case "1":
          this.contractAddr = this.contractsArray[this.selected];
          this.contractABI = contract.USDCE;
          await this.provider.request({
            method: "wallet_switchEthereumChain",
            params: [
              {
                chainId: "0xA86A",
              },
            ],
          });
          break;
        case "2":
          this.contractAddr = this.contractsArray[this.selected];
          this.contractABI = contract.USDTERC20;
          await this.provider.request({
            method: "wallet_switchEthereumChain",
            params: [
              {
                chainId: "0x1",
              },
            ],
          });
          break;
        case "3":
          this.contractAddr = this.contractsArray[this.selected];
          this.contractABI = contract.BUSD;
          await this.provider.request({
            method: "wallet_switchEthereumChain",
            params: [
              {
                chainId: "0x38",
              },
            ],
          });
          break;
      }
    },
  },
  computed: {
    ...mapGetters("wallet", ["getWeb3", "getUserAccount"]),
    deadline() {
      return 1636593013398 - new Date().getTime();
    },
  },
  watch: {
    selected() {
      this.watcher();
    },
  },
};
</script>

<style>
@import "./css/styles.css";
</style>
