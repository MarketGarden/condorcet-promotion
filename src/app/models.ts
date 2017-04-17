import { forEach } from '@angular/router/src/utils/collection';
import { deserializeSummaries } from '@angular/compiler/src/aot/summary_serializer';
import { serialize } from '@angular/compiler/src/i18n/serializers/xml_helper';

import { List } from 'linqts';

export class Candidate {
  name: string;
}

export class Election{
  name: string;
  candidates : Array<Candidate>;
}


export class Vote {

    ranking : Array<Rank> = [];

    addRank(){
        this.ranking.push({
        candidates : [],
        rank : this.ranking.length
      });
    }

    deleteRank(){
      let index = this.ranking.findIndex(x=> x.candidates.length==0);
      if(index>=0){
        this.ranking.splice(index, 1);

        for(let i = 0; i<this.ranking.length;i++){
            this.ranking[i].rank = i;
        }
      }
    }

    addCandidate(candidate : Candidate) : void {
      //let last = this.ranking.length-1;
      this.ranking[0].candidates.push(candidate); 
    }
    
    deleteCandidate(candidate : Candidate):void{
      for(let rank of this.ranking) {
        let index = rank.candidates.findIndex(x=> x==candidate);
        if(index>=0){
          rank.candidates.splice(index,1);
        }
      }
    }

    constructor(public name: string,public quantity : number, candidates : Array<Candidate> ){
      for(let candidate of candidates){
       this.addRank();
        this.addCandidate(candidate);
      }
    }
}

export class Rank{
  candidates : Array<Candidate>;
  rank : number;
}

export class Duel {
  
  ticScore : number = 0;
  tacScore : number = 0;

  public get  distance() : number {
    return Math.abs(this.ticScore-this.tacScore); 
  }

  public get ticWin() : boolean{
      return this.ticScore > this.tacScore
  }
  
  public get tacWin() : boolean{
      return  this.tacScore > this.ticScore;
  }

  public get winnerIfExist() : Candidate {
      if(this.ticWin) return this.tic;
      if(this.tacWin) return this.tac;
      return null;
  }

  public get looserIfExist() : Candidate {
      if(this.ticWin) return this.tac;
      if(this.tacWin) return this.tic;
      return null;
  }

  constructor(public tic: Candidate, public tac: Candidate){
       
  }

  resetScores():void{
    this.ticScore = 0;
    this.tacScore = 0;
  }

  public static fromCandidates(candidates : Array<Candidate>) : Array<Duel>{
    let result = new Array<Duel>();

    for(let i =0;i<candidates.length-1;i++){
        for(let j =i+1; j<candidates.length;j++){
            result.push(new Duel(candidates[i],candidates[j]));
        }
    }

    return result;
  }
}

export class SimulationRequest {

  constructor(
      public election : Election,
      public votes : Array<Vote>
  ) {

  }

  public static defaultFactory(election : Election) : SimulationRequest{
    return new SimulationRequest(election, []);
  }

}

export class CandidateResult {
  
  winAgainst : Array<Candidate> = [];

  constructor(public candidate : Candidate){

  }

  reset(){
    this.winAgainst.length = 0;
  }

  get score()  : number{
      return this.winAgainst.length;
  }
}

export class Simulation {
  
  get votes() {
    return this.request.votes;
  }

  get elections(){
    return this.request.election;
  }
  
  duels : Array<Duel>;
  results : Array<CandidateResult>;
  
  constructor(public request : SimulationRequest){
    this.duels = Duel.fromCandidates(this.elections.candidates);
    this.results = new List<Candidate>(this.elections.candidates).Select(x=> new CandidateResult(x)).ToArray();

    this.update()
  }
  
  update(){
    this.updateDuels();
    this.updateResults();
  }

  updateDuels() : void{
    for(let duel of this.duels){
      duel.resetScores();

        for(let vote of this.votes){
            let ranking = vote.ranking;
            let tic = ranking.find(x=>x.candidates.find( y=> y == duel.tic)!=undefined);
            let tac = ranking.find(x=>x.candidates.find( y=> y == duel.tac)!=undefined);
            
            if (tic.rank < tac.rank){
              duel.ticScore += vote.quantity;
            }
            else if (tac.rank < tic.rank){
              duel.tacScore += vote.quantity;
            }
            else{
              // egality => nop
            }
        }
    }

    this.duels.sort((a,b)=>  Math.abs(a.distance - b.distance));

  }

  updateResults(){
    let duels = new List<Duel>(this.duels)

    for(let result of this.results){
        result.reset();

        let winAgainst : Array<Candidate>= duels.Where(x=> x.winnerIfExist == result.candidate).Select( x=>x.looserIfExist).ToArray();
        result.winAgainst.push(...winAgainst);
    }
    
    this.results.sort((x,y)=> y.score -x.score);
  }

  public deleteCandidate(candidate: Candidate) : void {
    for(let vote of this.votes) {
      vote.deleteCandidate(candidate);
      vote.deleteRank();
    }

    for(let duel of this.duels.filter(x=> x.tac== candidate || x.tic==candidate)){
            let i = this.duels.indexOf(duel);
            this.duels.splice(i,1);
    }
    
    this.results.splice(this.results.findIndex(x=> x.candidate == candidate), 1);
    this.elections.candidates.splice(this.elections.candidates.indexOf(candidate),1);

    this.update();
  }

  public deleteVote(vote : Vote){
    let index = this.votes.indexOf(vote);
    this.votes.splice( index, 1 );
    this.update();
  }



  public addVote(name : string) : void{
      let newVote : Vote = new Vote(name,1,this.elections.candidates);    
      this.votes.push(newVote);
      this.update();   
  }

  public addCandidate(candidateName: string){
    let added = {name : candidateName};
    
    for(let vote of this.votes){
      vote.addRank();
      vote.addCandidate(added);
    }

    for(let candidate of this.elections.candidates){
      this.duels.push(new Duel(candidate, added));
    }
    this.results.push(new CandidateResult(added));
    this.elections.candidates.push(added);
    this.update();
  }
}