import { environment } from '../../environments/environment';
import { Candidate, CandidateVote, Election, Simulation, SimulationRequest, Vote } from '../models';
import { Inject, Component, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { List } from "linqts";


const DEFAULT_ELECTION : Election =  {
    name : "Election présidentielle 2017",
    candidates  : [
      {name:"François Fillon"},
      {name:"Benoît Hamon"},
      {name:"Emmanuel Macron"},
      {name:"Marine Le Pen"},
      {name:"Jean Luc Melenchon"},
      {name:"Jacques Cheminade"},
      {name:"Jean Lassalle"},
      {name:"Nathalie Arthaud"},
      {name:"Philippe Poutou"},
      {name:"François Asselineau"},
      {name:"Nicolas Dupont Aignan"}
      ], 
  }

const TEST_ELECTION : Election = {
      name : "Election présidentielle 2017",
    candidates  : [
      {name:"François Fillon"},
      {name:"Benoît Hamon"},
      {name:"Emmanuel Macron"},
      {name:"Marine Le Pen"},
      {name:"Jean Luc Melenchon"},
      ]
}

const JSON_PERMANENT_LINK_KEY ="json-raw";

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
    this.simulation.addCandidate("Candidat " + (this.simulation.elections.candidates.length+1));
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
    return  environment.virtualPath + JSON_PERMANENT_LINK_KEY + "/" + encodeURIComponent(JSON.stringify(this.simulation.request ));
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
      for(let candidate of vote.candidates){
        voteString += candidate.enabled ? ">" : "-";
        voteString += this.simulation.request.election.candidates.indexOf(candidate.candidate);
      }
      votesString.push(voteString);
    }

    return "/pl/" + encodeURIComponent(nameString) + "/"+ encodeURIComponent(candidateString.join("+")) + "/" 
    +encodeURIComponent(votesString.join("+"));
  }

  public loadFromLink() : boolean {

    let a= this.document.location.href.split("/");
    if (a.length>3 && a[a.length-2]==JSON_PERMANENT_LINK_KEY){
      console.debug(decodeURIComponent(a[a.length -1]));
      let json  : SimulationRequest=JSON.parse(decodeURIComponent(a[a.length -1]));
      console.debug(json);
      let result =SimulationRequest.defaultFactory(json.election);
      let votes = new List<Vote>(json.votes);

      //relink correctly instances of candidates
      for(let vote of json.votes){
        for(let choise of vote.candidates){
            let candidate =json.election.candidates.find(x=>x.name == choise.candidate.name);
            choise.candidate = candidate;
        }
      }
      this.simulation = new Simulation(json);
      return true;
    }
    else{
      return false;
    }
  }
}
