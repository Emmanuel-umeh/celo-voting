import React, { useState, useEffect } from "react";
import { useContractKit, newKitFromWeb3 } from "@celo-tools/use-contractkit";
import "@celo-tools/use-contractkit/lib/styles.css";
import votingABI from "./contracts/voting.abi.json";

const ContractAddress = "0x0A3315a231D62779429C70df13026A1B1c9E208B";
export default function App() {
  const { connect, address, kit, performActions, getConnectedKit } =
    useContractKit();

  const [loading, setloading] = useState(false);

  const [celoBalance, setCeloBalance] = useState(0);

  const [cUSDBalance, setcUSDBalance] = useState(0);
  const [candidates, setcandidates] = useState([]);
  const [contract, setcontract] = useState(null);

  const ERC20_DECIMALS = 18;

  const getBalance = async function () {

    const kit = await getConnectedKit();
    const balance = await kit.getTotalBalance(address);
    const celoBalance = balance.CELO.shiftedBy(-ERC20_DECIMALS).toFixed(2);
    const USDBalance = balance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);

    const contract = new kit.web3.eth.Contract(votingABI, ContractAddress);

    setcontract(contract);
    setCeloBalance(celoBalance);
    setcUSDBalance(USDBalance);
  };

  const getCandidates = async function () {
    const _candidateLength = await contract.methods.getCandidateLength().call();
    const _candidates = [];

    for (let i = 0; i < _candidateLength; i++) {
      let _cand = new Promise(async (resolve, reject) => {
        let _candidate = await contract.methods.candidates(i).call();
        resolve({
          index: i,
          name: _candidate[0],
          party: _candidate[1],
          voteCount: _candidate[2],
          creationDate: _candidate[3],
          expirationDate: _candidate[4],
          // price: new BigNumber(candidate[5]),
          // sold: candidate[6],
        });
      });
      _candidates.push(_cand);
    }
    const all_candidates = await Promise.all(_candidates);
    setcandidates(all_candidates);
  };

  const voteCandidate = async (key) => {
    try {
      await performActions(async (kit) => {
        console.log({ kit });
        console.log({ address });

        const candidate = await contract.methods
          .vote(key)
          .send({ from: kit.defaultAccount });
        console.log({ candidate });
        getCandidates();
      });
    } catch (error) {
      console.log({ error });
      alert(error);
    }
  };

  useEffect(() => {
    if (contract) return getCandidates();
  }, [contract]);

  useEffect(() => {
    (async () => {
      setloading(true);
      if (!address) {
        await connect();
      }

      const kit = await getConnectedKit();
      console.log(kit.getWallet());
      await getBalance();

      setloading(false);
    })();
  }, [address]);

  if (!address) {
    return (
      <section id="about" className="bg-primary text-white mb-0">
        <div className="container">
          <h2 className="text-uppercase text-center text-white">Celo Vote</h2>
          <hr className="star-light mb-5" />
          <div className="row">
            <div className="col-lg-12 ml-auto">
              <center>
                <h1>Lets get you started on your voting dapp</h1>

                <button
                  className="regBtn btn-primary btn-xl"
                  id="registerbtn"
                  onClick={() => {
                    connect();
                  }}
                >
                  Connect!
                </button>
              </center>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    // <>
    //   {address ? (
    //     <div>Connected to {address}</div>
    //   ) : (
    //     <button onClick={connect}>Connect wallet</button>
    //   )}
    // </>

    <div>
      <nav
        className="navbar navbar-light navbar-expand-lg fixed-top bg-secondary text-uppercase"
        id="mainNav"
      >
        <div className="container">
          <a className="navbar-brand js-scroll-trigger" href="#page-top">
            Celo Vote
          </a>
          <button
            className="navbar-toggler navbar-toggler-right text-uppercase bg-primary text-white rounded"
            data-toggle="collapse"
            data-target="#navbarResponsive"
            aria-controls="navbarResponsive"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="fa fa-bars" />
          </button>
          <div className="collapse navbar-collapse" id="navbarResponsive">
            <ul className="nav navbar-nav ml-auto">
              <li className="nav-item mx-0 mx-lg-1" role="presentation">
                <a
                  className="nav-link py-3 px-0 px-lg-3 rounded js-scroll-trigger"
                  href="#portfolio"
                >
                  Election
                </a>
              </li>
              <li className="nav-item mx-0 mx-lg-1" role="presentation">
                <a
                  className="nav-link py-3 px-0 px-lg-3 rounded js-scroll-trigger"
                  href="#about"
                >
                  Account
                </a>
              </li>
            
            </ul>
          </div>
        </div>
      </nav>
      <div id="scrollbar">
        <header className="masthead bg-primary text-white text-center ">
          <div className="container">
            <img
              className="img-fluid d-block mx-auto mb-5"
              src="assets/img/profile.png"
            />
            {loading && (
              <div id="loading-bar-spinner" className="spinner">
                <div className="spinner-icon" />
              </div>
            )}

            <h1>Celo Vote</h1>
            <hr className="star-light" />
            <h2 className="font-weight-light mb-0">
              Democracy- Voting - Security&nbsp
            </h2>
          </div>
        </header>
        <section id="portfolio" className="portfolio">
          <div className="container">
            <h2 className="text-uppercase text-center text-secondary">
              Candidates
            </h2>
            <hr className="star-dark mb-5" />

            <div className="row">
              {candidates &&
                candidates.map((_candidate, key) => (
                  <div
                    className="col-lg-4"
                    key={key}
                    style={{
                      marginBottom: 20,
                    }}
                  >
                    <div
                      className="carousel slide"
                      data-ride="carousel"
                      id="carousel"
                    >
                      <div className="carousel-inner" role="listbox">
                        <div className="carousel-item active">
                          <img
                            id="images"
                            className="w-100 d-block"
                            src="https://images.pexels.com/photos/4669141/pexels-photo-4669141.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260"
                            alt="Slide Image"
                            style={{
                              height: 400,
                            }}
                          />
                        </div>
                      </div>
                      <div id="votes">
                        <center>
                          <h3>{_candidate.name} </h3>
                          <h4>{_candidate.party} </h4>
                          <h5>Number of Votes : {_candidate.voteCount} </h5>
                        </center>
                      </div>
                      <center>
                        <div>
                          <button
                            className="btn btn-dark voteBtn"
                            onClick={() => {
                              voteCandidate(key);
                            }}
                          >
                            Vote!
                          </button>
                        </div>
                      </center>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div id="body"></div>
        </section>
        <section id="about" className="bg-primary text-white mb-0">
          <div className="container">
            <h2 className="text-uppercase text-center text-white">Account</h2>
            <hr className="star-light mb-5" />
            <div className="row">
              <div className="col-lg-12 ml-auto ">
                <center>
                  <p>Your address : {address}</p>{" "}
                  <p>Your cUSD balance : {cUSDBalance}</p>{" "}
                  <p>Your Celo balance : {celoBalance}</p>{" "}
                </center>
              </div>
            </div>
            <div className="text-center mt-4" />
          </div>
        </section>
        {/* <section id="contact" className="registerForm">
          <div className="container">
            <h2 className="text-uppercase text-center text-secondary mb-0">
              Create Election
            </h2>
            <hr className="star-dark mb-5" />
            <div className="row">
              <div className="col-lg-8 mx-auto">
                <form
                  id="contactForm"
                  name="sentMessage"
                  noValidate="novalidate"
                >
                  <div className="control-group">
                    <div className="form-group floating-label-form-group controls mb-0 pb-2 font-weight-light mb-0">
                      <label>Name</label>
                      <input
                        className="form-control"
                        type="text"
                        required
                        placeholder="Name"
                        id="Candidatename"
                      />
                      <small className="form-text text-danger help-block" />
                    </div>
                  </div>
                  <div className="control-group">
                    <div className="form-group floating-label-form-group controls mb-0 pb-2 font-weight-light mb-0">
                      <label>First Image</label>
                      <input
                        className="form-control"
                        type="text"
                        required
                        placeholder="Image "
                        id="Candidateimage1"
                      />
                      <small className="form-text text-danger help-block" />
                    </div>
                  </div>
                  <div className="control-group">
                    <div className="form-group floating-label-form-group controls mb-0 pb-2 font-weight-light mb-0">
                      <label>Second Image</label>
                      <input
                        className="form-control"
                        type="text"
                        required
                        placeholder="Image"
                        id="Candidateimage2"
                      />
                      <small className="form-text text-danger help-block" />
                    </div>
                  </div>
                  <div className="control-group">
                    <div className="form-group floating-label-form-group controls mb-0 pb-2 font-weight-light mb-0">
                      <label>Third Image</label>
                      <input
                        className="form-control"
                        type="text"
                        required
                        placeholder="Image"
                        id="Candidateimage3"
                      />
                      <small className="form-text text-danger help-block" />
                    </div>
                  </div>
                  <div className="control-group">
                    <div className="form-group floating-label-form-group controls mb-5 pb-2 font-weight-light mb-0">
                      <textarea
                        className="form-control"
                        rows={5}
                        required
                        placeholder="Description"
                        id="Candidatemessage"
                        defaultValue={""}
                      />
                      <small className="form-text text-danger help-block" />
                    </div>
                  </div>
                  <div id="success" />
                </form>
                <div>
                  <button
                    className="regBtn btn-primary btn-xl"
                    id="registerbtn"
                  >
                    Create Election!
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
    */}
      </div>
      {/* mustache */}
      {/* <script id="template" type="x-tmpl-mustache">
    {'{'}{'{'}#CandidateArray{'}'}{'}'}
    <div class="carousel slide" data-ride="carousel" id="carousel-{'{'}{'{'}id{'}'}{'}'}">
    <div class="carousel-inner" role="listbox" >
    <div class="carousel-item active"><img id = "images" class="w-100 d-block" src="{'{'}{'{'}image1{'}'}{'}'} " alt="Slide Image" style="height:400px" ></div>
    <div class="carousel-item"><img id = "images" class="w-100 d-block" src="{'{'}{'{'}image2{'}'}{'}'} " alt="Slide Image"  style="height:400px"> </div>
    <div class="carousel-item"><img id = "images" class="w-100 d-block" src="{'{'}{'{'}image3{'}'}{'}'} " alt="Slide Image" style="height:400px" ></div>
    </div>
    <div><a class="carousel-control-prev" href="#carousel-{'{'}{'{'}id{'}'}{'}'}" role="button" data-slide="prev"><span class="carousel-control-prev-icon"></span><span class="sr-only">Previous</span></a><a class="carousel-control-next" href="#carousel-{'{'}{'{'}id{'}'}{'}'}" role="button"
    data-slide="next"><span class="carousel-control-next-icon"></span><span class="sr-only">Next</span></a></div>
    <ol class="carousel-indicators">
    <li data-target="#carousel-{'{'}{'{'}id{'}'}{'}'}" data-slide-to="0" class="active"></li>
    <li data-target="#carousel-{'{'}{'{'}id{'}'}{'}'}" data-slide-to="1"></li>
    <li data-target="#carousel-{'{'}{'{'}id{'}'}{'}'}" data-slide-to="2"></li>
    </ol>
    </div>
    <div id = "votes"><h3>Number of Votes : {'{'}{'{'}voteCount{'}'}{'}'}</h3></div>
    <center>
    <div >
    <button class="btn btn-dark voteBtn" id="{'{'}{'{'}id{'}'}{'}'}">Vote!</button>
    </div>
    </center>
    </div>
    {'{'}{'{'}/CandidateArray{'}'}{'}'}
  </script> */}
    </div>
  );
}
