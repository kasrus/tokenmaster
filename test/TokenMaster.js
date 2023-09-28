const { expect } = require("chai");

const NAME = "TokenMaster";
const SYMBOL = "TM";
  
const OCCASION_NAME = "ETH Texas";
const OCCASION_COST = ethers.utils.parseUnits('1', 'ether');
const OCCASION_MAX_TICKETS = 100;
const OCCASION_DATE = "Apr 27";
const OCCASION_TIME = "10:00AM CST";
const OCCASION_LOCATION = "Austin, Texas";

describe("TokenMaster", () => {
  let tokenMaster;
  let deployer, buyer;

  beforeEach(async () => {
    //Setup accounts
    [deployer, buyer] = await ethers.getSigners();

    const TokenMaster = await ethers.getContractFactory(NAME);
    tokenMaster = await TokenMaster.deploy(NAME, SYMBOL);

    const transaction = await tokenMaster.connect(deployer).list(
      OCCASION_NAME, OCCASION_COST, OCCASION_MAX_TICKETS, OCCASION_DATE, OCCASION_TIME, OCCASION_LOCATION
      );
    await transaction.wait();
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
    it('updates occasions count', async() => {
      const totalOccasions = await tokenMaster.totalOccasions();
      expect(totalOccasions).to.equal(1);
    })

    it('returns occasions attributes', async() => {
      const occasion = await tokenMaster.getOccasion(1);
      expect(occasion.id).to.equal(1);
      expect(occasion.name).to.equal(OCCASION_NAME);
      expect(occasion.cost).to.equal(OCCASION_COST);
      expect(occasion.tickets).to.equal(OCCASION_MAX_TICKETS);
      expect(occasion.date).to.equal(OCCASION_DATE);
      expect(occasion.time).to.equal(OCCASION_TIME);
      expect(occasion.location).to.equal(OCCASION_LOCATION);
    })
  })

  describe("Minting", () => {
    const ID = 1;
    const SEAT = 50;
    const AMOUNT = ethers.utils.parseUnits('1', 'ether');

    beforeEach(async() => {
      const transaction = await tokenMaster.connect(buyer).mint(ID, SEAT, {value: AMOUNT});
      await transaction.wait();
    })

    describe("Success", () => {
      it('updates ticket count', async() => {
        const occasion = await tokenMaster.getOccasion(1);
        expect(occasion.tickets).to.equal(OCCASION_MAX_TICKETS - 1);
      })

      it('updates buying status', async() => {
        const status = await tokenMaster.hasBought(ID, buyer.address);
        expect(status).to.equal(true);
      })

      it('updates seat status', async() => {
        const owner = await tokenMaster.seatTaken(ID, SEAT);
        expect(owner).to.equal(buyer.address);
      })

      it('updates overall seating status', async() => {
        const seats = await tokenMaster.getSeatsTaken(ID);
        expect(seats.length).to.equal(1);
        expect(seats[0]).to.equal(SEAT);
      })

      it('updates the contract balance', async() => {
        const balance = await ethers.provider.getBalance(tokenMaster.address); //getting the balance of the smart contract using ethers
        expect(balance).to.equal(AMOUNT);
      })
    })

    describe("Failure", () => {
      it('rejects invalid ids', async() => {
        await expect(tokenMaster.connect(buyer).mint(0, SEAT, { value: AMOUNT })).to.be.reverted;
        await expect(tokenMaster.connect(buyer).mint(2, SEAT, { value: AMOUNT })).to.be.reverted;
      })

      it('rejects when seat is already purchased', async() => {
        await expect(tokenMaster.connect(buyer).mint(ID, SEAT, { value: AMOUNT })).to.be.reverted;
      })

      it('rejects insufficient ethers', async() => {
        const COST = ethers.utils.parseUnits('10', 'ether')
        const transaction = await tokenMaster.connect(deployer).list(
          OCCASION_NAME, COST, OCCASION_MAX_TICKETS, OCCASION_DATE, OCCASION_TIME, OCCASION_LOCATION);
        await transaction.wait();
        await expect(tokenMaster.connect(buyer).mint(2, SEAT, { value: AMOUNT })).to.be.reverted;  
      })
    })
  })    
})