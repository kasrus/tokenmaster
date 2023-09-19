const { expect } = require("chai");

const NAME = "TokenMaster";
const SYMBOL = "TM";
  
describe("TokenMaster", () => {
  let tokenMaster;
  let deployer, buyer;

  beforeEach(async () => {
    const TokenMaster = await ethers.getContractFactory(NAME);
    tokenMaster = await TokenMaster.deploy(NAME, SYMBOL);

    //Setup accounts
    [deployer, buyer] = await ethers.getSigners();
  })

  describe("Deployment", () => {
    it('sets the name', async() => {
      expect(await tokenMaster.name()).to.equal(NAME);
    })

    it('sets the symbol', async() => {
      expect(await tokenMaster.symbol()).to.equal(SYMBOL);
    })

    it('sets the owner', async() => {
      expect(await tokenMaster.owner()).to.equal(deployer.address);
    })
  })

  describe("Occasions", () => {
    it('Updates occasions count', async() => {
      
    })
  })
})