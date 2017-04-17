import { environment } from '../../environments/environment';
import { Candidate, Election, Simulation, SimulationRequest, Vote } from '../models';
import { Inject, Component, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { List } from "linqts";


const DEFAULT_ELECTION : Election =  {
    name : "Mon election",
    candidates  : [], 
  }


const JSON_PERMANENT_LINK_KEY ="#json-raw-";

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.css']
})
export class SimulationComponent implements OnInit {

  constructor(@Inject(DOCUMENT) private document: any) {

   if(!this.loadFromLink()){
    this.simulation = new Simulation(
      SimulationRequest.defaultFactory(DEFAULT_ELECTION)
    );
   }
  }

  ngOnInit() {

  }

  simulation : Simulation;
  
  public onAddVote() : void{
    this.simulation.addVote("Electeurs " + (this.simulation.votes.length+1));
  }
  
  public onAddCandidate(){
    this.simulation.addCandidate("Choix " + (this.simulation.elections.candidates.length+1));
  }

  public onChangeSort() : void{
      this.simulation.update();
  }

  public deleteCandidate(candidate: Candidate) : void {
    this.simulation.deleteCandidate(candidate);
  }

  public deleteVote(vote : Vote) : void{
    this.simulation.deleteVote(vote);
  }
  
  public get permanentLink() : string{
    return  environment.virtualPath + JSON_PERMANENT_LINK_KEY + encodeURIComponent(JSON.stringify(this.simulation.request ));
    
  }

  public get compactLink() : string {
    let index = 0;
    let nameString = this.simulation.request.election.name
    let candidateString = []
    for(let candidate of this.simulation.request.election.candidates){
      candidateString.push(candidate.name);
    }

    let votesString = [];
    for (let vote of this.simulation.request.votes){
      let voteString = vote.quantity + ":"+ vote.name
      for(let rank of vote.ranking){
        voteString += ">";
        for(let candidate of rank.candidates){
          //TODO impl
        }

      }
      votesString.push(voteString);
    }

    return "/pl/" + encodeURIComponent(nameString) + "/"+ encodeURIComponent(candidateString.join("+")) + "/" 
    +encodeURIComponent(votesString.join("+"));
  }

  public loadFromLink() : boolean {

    let a= this.document.location.href.split(JSON_PERMANENT_LINK_KEY);
    if (a.length==2){
      console.debug("decoding",decodeURIComponent(a[a.length -1]));
      let json  : SimulationRequest=JSON.parse(decodeURIComponent(a[a.length -1]));
      console.debug("loading",json);
      let result = SimulationRequest.defaultFactory(json.election);
      
      //relink correctly instances of candidates

      let newvotes :Array<Vote>= [];    

      for(let vote of json.votes){
        let newvote = new Vote(vote.name, 0, []);

        for(let rank of vote.ranking){
          let updated :Array<Candidate>= [];
          for(let candidate of rank.candidates){
              let newcandidate =json.election.candidates.find(x=>x.name == candidate.name);
              updated.push(newcandidate);
          }
          rank.candidates = updated;
        }
        newvote.ranking = vote.ranking;
        newvotes.push(newvote);
      }
      json.votes = newvotes;
      this.simulation = new Simulation(json);
      console.debug("loaded",this.simulation);
      return true;
    }
    else{
      return false;
    }
  }
}
