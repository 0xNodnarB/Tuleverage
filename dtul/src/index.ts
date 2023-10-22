import { createApp } from "@deroll/app";
import { createRouter } from "@deroll/router";
import { createWallet } from "@deroll/wallet";
import { decodeFunctionData, getAddress, parseAbi, stringToHex } from "viem";
import { verifyMessage } from "viem/dist/types/actions/public/verifyMessage";
type UserId = string;
const message = `
I, Danilo Tuler,

herein referred to as the "Undersigned",
do hereby acknowledge, attest, and affirm that I shall,
with full awareness and without coercion, remit a perpetual sum equal to twenty percent (20%) of the entirety of my gross revenue,
derived from any and all sources, to the esteemed beneficiaries
and recognized holders of the DTUl.

Furthermore,
the Undersigned irrevocably commits to maintaining an amicable and enduring relationship
with the two individuals, colloquially referenced as "dumbasses",
who were responsible for the drafting, programming, and implementation of the code underpinning this application.

This agreement is binding and shall be governed by and construed in accordance with applicable laws.
Printed Name: Mister Tuler
`;

class Pot {
    public totalAmount: number;
    public usersDTULs: Map<UserId, number>;
    public usersBalance: Map<UserId, number>;

    constructor() {
        this.totalAmount = 0;
        this.usersDTULs = new Map<UserId, number>();
        this.usersBalance = new Map<UserId, number>();
    }

    deposit(userId: UserId, amount: number): void {
        if (!this.usersDTULs.has(userId)) {
            this.usersDTULs.set(userId, 0);
            this.usersBalance.set(userId, 0);
        }

        this.totalAmount += amount;

        for (let [user, DTULs] of this.usersDTULs) {
            let proportion = DTULs / this.totalAmount;
            this.usersDTULs.set(user, this.totalAmount * proportion);
        }

        let userDTULs = this.usersDTULs.get(userId) as number;
        this.usersDTULs.set(userId, userDTULs + amount);
    }

    distribute(amount: number): void {
      let totalDTULs = this.getTotalDTULs();

      for (let [user, DTULs] of this.usersDTULs) {
          let proportion = DTULs / totalDTULs;
          let distribution = amount * proportion;
          let userBalance = this.usersBalance.get(user) as number;
          this.usersBalance.set(user, userBalance + distribution);

          console.log(`transferring ${distribution} ether to user ${user}`);
      }
  }

    getTotalAmount(): number {
        return this.totalAmount;
    }

    getDTULsForUser(userId: UserId): number {
        return this.usersDTULs.get(userId) || 0;
    }

    getTotalDTULs(): number {
        let total = 0;
        for (let DTULs of this.usersDTULs.values()) {
            total += DTULs;
        }
        return total;
    }
}
const rollupServer =
  process.env.ROLLUP_HTTP_SERVER_URL || "http://localhost:8080/host-runner";

console.log("starting app with rollup server ");

var dtulerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
var pot = new Pot();

var tulerSigned = false;

const app = createApp({ url: rollupServer });
const abi = parseAbi([
  "function balanceOf(address userAddr)",
  "function sign()",
  "function transfer(address to, uint256 amount)",
]);

app.addAdvanceHandler(async ({ payload, metadata }) => {
  try {
    const { functionName, args } = decodeFunctionData({ abi, data: payload });
    let senderAddr = getAddress(metadata.msg_sender);
    switch (functionName) {
      case "balanceOf":
        const [userAddr] = args;
        console.log(`The ${userAddr} balance is ${wallet.balanceOf(userAddr)}`);
        return "accept";

      case "sign":
        if(isTuler(senderAddr)){
          tulerSigned = true;
          console.log(message);

          //let hexMessage = stringToHex(message);
          //app.createNotice({ payload: `${hexMessage}`})

          wallet.withdrawEther(senderAddr, BigInt(pot.getTotalAmount()));
          logDaniloSigned(senderAddr, metadata.timestamp);

        } else {
          console.log("To Whom It May Concern:");
          console.log("");
          console.log("Regrettably, your attestation does not align with our records indicating that you are not, in fact, the aforementioned \"Danilo\". Simply put, you lack the requisite 'chad' credentials. We advise diligence and integrity in your future interactions.");
          console.log("");
          console.log("Be forewarned: any subsequent attempt to misrepresent oneself or impersonate another party, especially within this blockchain domain, may result in legal repercussions.");
          console.log("Remember: this is blockchain, yo – all transactions and declarations are irrevocably recorded.");
          console.log("");
          console.log("Exercise caution.");
        }

        return "accept";
      
      case "transfer":
        const [to, amount] = args;

        if (isTuler(getAddress(metadata.msg_sender)) && tulerSigned) {
          console.log("DANILO PAID HIS DUTIES")
          wallet.transferEther(metadata.msg_sender, to, amount);

          pot.distribute(Number(amount));

          return "accept";
        }

        if (!tulerSigned && !isTuler(getAddress(metadata.msg_sender))) {
          console.log(`Transfering ${amount} to ${to}`);
        
          pot.deposit(metadata.msg_sender, Number(amount));
          console.log(`SIZE OF THE POT: ${pot.getTotalAmount()} `);
          console.log(`DTULS OF ${metadata.msg_sender}:  ${pot.getDTULsForUser(metadata.msg_sender)}`);
          console.log(`TOTAL DTULs ${pot.getTotalDTULs()} `);

          wallet.transferEther(metadata.msg_sender, to, amount);

          return "accept";
        }

        console.log("Are you dtul or are you a fool?");
        console.log("either the man has signed, and is no longer selling himself");
        console.log("or you're man, you havent signed and there is no point in distributing revenue");

        return "accept";
    }
  } catch (e) {
    return "reject";
  }
});

const wallet = createWallet();
const router = createRouter({ app });

app.addAdvanceHandler(wallet.handler);

router.add<{ address: string }>(
  "wallet/:address",
  ({ params: { address } }) => {
    return JSON.stringify({
      balance: wallet.balanceOf(address).toString(),
    });
  }
);
app.addInspectHandler(router.handler);

app.start().catch((e) => process.exit(1));

function isTuler(add: string): boolean {
  return add == dtulerAddress;
}

function logDaniloSigned(sender: string, timestamp: number) {
  console.log(`Dated this ${timestamp}.`);
  console.log(`Signature: ${sender}`);
}