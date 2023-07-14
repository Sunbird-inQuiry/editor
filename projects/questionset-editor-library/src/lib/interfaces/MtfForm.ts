import * as _ from "lodash-es";

export class MtfOption {
  constructor(public leftOption: string, public rightOption: string) {}
}

export interface MtfData {
  question: string;
  options: Array<MtfOption>;
  answer?: object;
  learningOutcome?: string;
  complexityLevel?: string;
  maxScore?: number;
}

export interface MtfConfig {
  templateId?: string;
  numberOfOptions?: number;
  maximumOptions?: number;

}

export class MtfForm {
  public question: string;
  public options: Array<MtfOption>;
  public templateId: string;
  public answer: object;
  public learningOutcome?: string;
  public complexityLevel?: string;
  public maxScore?: number;
  public maximumOptions;
  public numberOfOptions;

  constructor({question, options, answer, learningOutcome, complexityLevel, maxScore,}: MtfData,{ templateId, numberOfOptions, maximumOptions }: MtfConfig) {
    this.question = question;
    this.options = options || [];
    this.templateId = templateId;
    this.answer = answer || {};
    this.learningOutcome = learningOutcome;
    this.complexityLevel = complexityLevel;
    this.numberOfOptions = numberOfOptions || 2;
    this.maximumOptions = maximumOptions || 4;
    this.maxScore = maxScore;
    if (!this.options?.length) {
      _.times(this.numberOfOptions, index => this.options.push(new MtfOption("","")));
    }
  }

  addOptions() {
    this.options.push(new MtfOption("", ""));
  }

  deleteOptions(position: number) {
    this.options.splice(position, 1);
  }
}
