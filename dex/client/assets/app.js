let buyMode = true;
let token = undefined;
let web3, user, dexInst, tokenInst;
let priceData;
let finalInput, finalOutput;


// set address in your ganache.
const linkAddr = "0x395C89b77183a875f3B6ed64b4962C861EFF89f2";
const daiAddr = "0xAB6d45d95489750DAEF8761bf926Ab838d54ae3A";
const compAddr = "0x92fc3b3b111F2fB7ccFDA6Fdf5AcB00Bc88bB024";
const dexAddr = "0x7aE1AA0F5b3923B127Dc6b8628d9D31B9DBcA821";

$(document).on("click", ".dropdown-menu li a", function () {
  let element = $(this);
  let img = element[0].firstElementChild.outerHTML;
  let text = $(this).text();
  // token = text.replace(/\s/g, "");
  token = text.trim();
  if (user) {
    switch (token) {
      case "DAI":
        tokenInst = new web3.eth.Contract(abi.token, daiAddr, { from: user });
        break;
      case "LINK":
        tokenInst = new web3.eth.Contract(abi.token, linkAddr, { from: user });
        break;
      case "COMP":
        tokenInst = new web3.eth.Contract(abi.token, compAddr, { from: user });
        break;
    }
  }
  $(".input-group .btn").html(img + text);
  $(".input-group .btn").css("color", "#fff");
  $(".input-group .btn").css("font-size", "large");
});

// [jQueryの基本 - $(document).ready](https://qiita.com/8845musign/items/88a8c693c84ba63cea1d)
$(document).ready(async () => {
  // metamaskが接続されているとwindowオブジェクトにethereumというオブジェクトができる
  if (window.ethereum) {
    // Web3.givenProvider = metamaskが接続しているノードのアドレス
    // [Web3 Instance](https://web3js.readthedocs.io/en/v1.2.11/web3.html#web3-instance)
    // ReferenceError: Web3 is not definedになる。
    web3 = new Web3(Web3.givenProvider); // or web socket HttpProvider
    // HttpProvider : new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
    // or set HTTP by setProvider
    // [setProvider](https://web3js.readthedocs.io/en/v1.2.11/web3.html#setprovider)
  }
  priceData = await getPrice();
});

$(".btn.login").click(async () => {
  try {
    // https://docs.metamask.io/guide/ethereum-provider.html#methods
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })
    .catch((e) => console.error(e));
    user = accounts[0];
    // [web3.eth.Contract](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#web3-eth-contract)
    dexInst = new web3.eth.Contract(abi.dex, dexAddr, { from: user });
    // [jQueryのhtml()](https://www.sejuku.net/blog/38267)
    $(".btn.login").html("Connected");
    $(".btn.swap").html("Enter an amount");
    $("#username").html(user);
  } catch (error) {
    alert(error.message);
  }
});

// https://api.jquery.com/submit/
$("#swap-box").submit(async (e) => {
  // https://qiita.com/tochiji/items/4e9e64cabc0a1cd7a1ae
  e.preventDefault();

  try {
    buyMode ? await buyToken() : await sellToken();
  } catch (err) {
    alert(err.message);
  }
});

$("#arrow-box h2").click(() => {
  if (buyMode) {
    buyMode = false;
    sellTokenDisplay();
  } else {
    buyMode = true;
    buyTokenDisplay();
  }
});

// [inputイベントでフォーム入力値をリアルタイム取得できるよ。（あとjQuery例。）](https://ginpen.com/2018/01/30/realtime-form-values/)
$("#input").on("input", async function () {
  if (token === undefined) {
    return;
  }
  // https://www.sejuku.net/blog/45297
  const input = parseFloat($(this).val());
  await updateOutput(input);
});

// CoinGeckoAPI
async function getPrice() {
  // [JavaScriptのFetch API について](https://qiita.com/sotasato/items/31be24d6776f3232c0c0)
  const daiData = await (
    await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=dai&vs_currencies=eth"
    )
  ).json();

  const compData = await (
    await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=compound-governance-token&vs_currencies=eth"
    )
  ).json();

  const linkData = await (
    await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=chainlink&vs_currencies=eth"
    )
  ).json();

  return {
    daiEth: daiData.dai.eth,
    linkEth: linkData.chainlink.eth,
    compEth: compData["compound-governance-token"].eth,
  };
}

// customize html
async function updateOutput(input) {
  let output;
  switch (token) {
    case "COMP":
      output = buyMode ? input / priceData.compEth : input * priceData.compEth;
      break;
    case "LINK":
      output = buyMode ? input / priceData.linkEth : input * priceData.linkEth;
      break;
    case "DAI":
      output = buyMode ? input / priceData.daiEth : input * priceData.daiEth;
      break;
  }
  const exchangeRate = output / input;
  if (output === 0 || isNaN(output)) {
    $("#output").val("");
    $(".rate.value").css("display", "none");
    $(".btn.swap").html("Enter an amount");
    $(".btn.swap").addClass("disabled");
  } else {
    $("#output").val(output.toFixed(7));
    $(".rate.value").css("display", "block");
    if (buyMode) {
      $("#top-text").html("ETH");
      $("#bottom-text").html(" " + token);
      $("#rate-value").html(exchangeRate.toFixed(5));
    } else {
      $("#top-text").html(token);
      $("#bottom-text").html(" ETH");
      $("#rate-value").html(exchangeRate.toFixed(5));
    }
    await checkBalance(input);
    finalInput = web3.utils.toWei(input.toString(), "ether");
    finalOutput = web3.utils.toWei(output.toString(), "ether");
  }
}

async function checkBalance(input) {
  const balanceRaw = buyMode
    ? await web3.eth.getBalance(user)
    : await tokenInst.methods.balanceOf(user).call();
  const balance = parseFloat(web3.utils.fromWei(balanceRaw, "ether"));

  if (balance >= input) {
    $(".btn.swap").removeClass("disabled");
    $(".btn.swap").html("Swap");
  } else {
    $(".btn.swap").addClass("disabled");
    $(".btn.swap").html(`Insufficient ${buyMode ? "ETH" : token} balance`);
  }
}

function buyToken() {
  const tokenAddr = tokenInst._address;
  return new Promise((resolve, reject) => {
    dexInst.methods // testの時は dex.buyTokenでいけたが、実際は（？）methodsが間にいる。
      .buyToken(tokenAddr, finalInput, finalOutput)
      .send({ value: finalInput })
      .then((receipt) => {
        const eventData = receipt.events.buy.returnValues;
        // Cannot read properties of undefined (reading 'returnValues')
        const amountDisplay = parseFloat(
          web3.utils.fromWei(eventData._amount, "ether")
        );
        const costDisplay = parseFloat(
          web3.utils.fromWei(eventData._cost, "ether")
        );
        const tokenAddr = eventData._tokenAddr;
        alert(`
          Swap successful! \n
          Token address: ${tokenAddr} \n
          Amount: ${amountDisplay.toFixed(7)} ${token} \n
          Cost: ${costDisplay.toFixed(7)} ETH
        `);
        resolve();
      })
      .catch((err) => reject(err));
  });
}

async function sellToken() {
  // allowance(アドレスごとに許可された取引上限)が今回の取引額より小さけれこ今回の取引額で更新する。
  const allowance = await tokenInst.methods.allowance(user, dexAddr).call();
  if (parseInt(finalInput) > parseInt(allowance)) {
    try {
      await tokenInst.methods.approve(dexAddr, finalInput).send();
    } catch (err) {
      throw err;
    }
  }

  // スワップする。
  try {
    const tokenAddr = tokenInst._address; // なんでかわかんないけど _
    const sellTx = await dexInst.methods
      .sellToken(tokenAddr, finalInput, finalOutput)
      .send();
    // const eventData = sellTx.events.sell.returnValues;
    // const amountDisplay = parseFloat(
    //   web3.utils.fromWei(eventData._amount, "ether")
    // );
    // const costDisplay = parseFloat(web3.utils.fromWei(eventData._cost, "ether"));
    // const _tokenAddr = eventData._tokenAddr;
    // alert(`
    //     Swap successful!\n
    //     Token Address: ${_tokenAddr} \n
    //     Amount: ${amountDisplay.toFixed(7)} ETH\n
    //     Price: ${costDisplay.toFixed(7)} ${token}
    //   `);
  } catch (err) {
    throw err;
  }
}
