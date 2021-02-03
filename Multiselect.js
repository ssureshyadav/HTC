import {LightningElement, api, track, wire} from 'lwc';
import {getPicklistValues, getObjectInfo} from 'lightning/uiObjectInfoApi';

export default class ReusableMultiselectBox_LWC extends LightningElement {
    @api objAPIName;
    @api fieldAPIName;
    @api options = [];
    @api refreshoptions = [];
    @api selectedValue = [];
    @api selectedValuesList = [];
    @api index;
    @api placeholderval;
    @api disabled = false;
    @api HideSelectAllSection = false;
    // pick list label
    @api picklistlabel;
    @api error;
    @api controllingpicklistvalue;
    @api custompicklist = false;
    @track Focusedout = true;
    @track templateon;
    @track isdispatchEvent = false;
    filteredlst = [];
    //MainOptionsLst = [];
    @api defaultoptions = [];

    recordTypeId;
    objfieldAPIName;
    
    connectedCallback(){
        this.filteredlst = this.options;
        console.log('----->this.options'+this.options);
        //this.MainOptionsLst = this.options;
    }

    @api boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';

    focusout(){
         if(this.Focusedout){
             this.blurTimeout = setTimeout(() => { this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus' }, 300);             
            } 
    }

    inblur() { 
            this.blurTimeout = setTimeout(() => { this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus' }, 300);              
            this.Focusedout = true;
            if(this.isdispatchEvent){
                this.mainDispatchEvent();
                this.mainDispatchEventAura();
            }
            this.isdispatchEvent = false; 
        }

    templatefocus(event){
        event.stopPropagation();
        this.Focusedout = false;
    }
  

    handleClick(event) { 
        event.stopPropagation();
        if(this.boxClass == 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus slds-is-open'){
            this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
            this.templateon = false;
        }else if(this.boxClass != 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus slds-is-open'){
            this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus slds-is-open';
            this.Focusedout = true;
            this.templateon = true;
        }  
        console.log('calling in handleClick');
    }

    @wire(getObjectInfo, {objectApiName: '$objAPIName'})
    objectInfo(result) {
        if(result.data) {
            // Field Data
            let fieldData = result.data.fields[this.fieldAPIName];
            if(fieldData) {
                this.objfieldAPIName = {};
                this.objfieldAPIName.fieldApiName = fieldData.apiName;
                this.objfieldAPIName.objectApiName = result.data.apiName;
    
                this.recordTypeId = result.data.defaultRecordTypeId;
            }
            else {
                this.error = 'Please enter valid field api name';
            }
        }
        else if(result.error) {
            this.error = JSON.stringify(result.error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: '$objfieldAPIName'})
    picklistValues({error, data}) {
            if (data && this.filteredlst.length <= 0) {
                var i = 1;
                this.index = 0;
                let picklistOptions = []; //{ label: '--None--', value: '--None--'} 
                let defaultpicklistOptions = []; 
                let defaultpicklistOptionsObj = [];        
                    data.values.forEach(key => {
                        let indexx = this.index++;
                        if(this.defaultoptions.includes(key.value)){
                            picklistOptions.push({
                                label: key.label, 
                                value: key.value,
                                checked: true,
                                ind: indexx
                            })
                            defaultpicklistOptions.push(key.value)
                            defaultpicklistOptionsObj.push({
                                label: key.label, 
                                value: key.value,
                                checked: true,
                                ind: indexx
                            })
                        }else{
                            picklistOptions.push({
                                label: key.label, 
                                value: key.value,
                                checked: false,
                                ind: indexx
                            }) 
                        }
                    });
                this.filteredlst = picklistOptions;
                this.selectedValuesList = defaultpicklistOptions;
                this.selectedValue = defaultpicklistOptionsObj;
            }
            else if (error) {
                this.error = JSON.stringify(error);
            }    
    }

    
    handleselecteddata(event) {     
        var selectedRow = event.currentTarget;
        let index = selectedRow.dataset.id;   
        if(event.detail.checked){
            this.isdispatchEvent = true;
            let CheckedLst = [];
            this.filteredlst.forEach(key => {
                if(key.ind == index){
                    CheckedLst.push({"label":key.label,"value":key.value,"checked":true,"ind":key.ind});
                    this.selectedValuesList.push(key.value);
                    this.selectedValue.push(key);
                }else{
                    CheckedLst.push({"label":key.label,"value":key.value,"checked":key.checked,"ind":key.ind});
                }
            });
            // let fullmergelist = [];
            // CheckedLst.forEach(key => {
            //     this.MainOptionsLst.forEach(mainkey => {
            //         if(key.ind == mainkey.ind){
            //             fullmergelist.push({"label":key.label,"value":key.value,"checked":true,"ind":key.ind});
            //         }else{
            //             fullmergelist.push({"label":key.label,"value":key.value,"checked":key.checked,"ind":key.ind});
            //         }
            //     });
            // });
            this.filteredlst = CheckedLst;
            // this.MainOptionsLst = fullmergelist;
        }else{
            this.isdispatchEvent = true;
            var newindex;
            this.selectedValue.forEach(item => {
                if(item.ind == index){
                    newindex = this.selectedValue.indexOf(item);
                }
            });
            this.selectedValue.splice(newindex, 1);
            this.selectedValuesList = [];
            this.selectedValue.forEach(item => {
                this.selectedValuesList.push(item.value);
            });
            let CheckedLst = [];
            this.filteredlst.forEach(key => {
                if(key.ind == index){
                    CheckedLst.push({"label":key.label,"value":key.value,"checked":false,"ind":key.ind});
                }else{
                    CheckedLst.push({"label":key.label,"value":key.value,"checked":key.checked,"ind":key.ind});
                }
            });
            this.filteredlst = CheckedLst;           
        }
      //  this.mainDispatchEvent();

    }

@api refreshoptionsmethod(){
    this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
        this.selectedValuesList = []; 
        this.selectedValue = [];
        let CheckedLst = [];       
        this.filteredlst.forEach(key => {       
            CheckedLst.push({"label":key.label,"value":key.value,"checked":false,"ind":key.ind});
        });
        this.filteredlst = CheckedLst;
        //this.mainDispatchEvent(); 
    }

    SelectAllmethod(){
        this.isdispatchEvent = true;
        this.selectedValuesList = []; 
        this.selectedValue = []; 
        let CheckedLst = [];   
        this.filteredlst.forEach(key => {
            this.selectedValuesList.push(key.value);
            this.selectedValue.push({"label":key.label,"value":key.value,"checked":true,"ind":key.ind});
            CheckedLst.push({"label":key.label,"value":key.value,"checked":true,"ind":key.ind});
        });
        this.filteredlst = CheckedLst;
      //  this.mainDispatchEvent();
    }

    NoneMethod(){
        this.isdispatchEvent = true;
        this.selectedValuesList = []; 
        this.selectedValue = []; 
        let CheckedLst = [];    
        this.filteredlst.forEach(key => {
            CheckedLst.push({"label":key.label,"value":key.value,"checked":false,"ind":key.ind});
        }); 
        this.filteredlst = CheckedLst;
       // this.mainDispatchEvent(); 
    }

    // Searchtheoptions(event){
    //     let str = event.target.value;
    //     //this.filteredlst = this.options;
    //     console.log('this.filteredlst--->before-->'+JSON.stringify(this.filteredlst));
    //         let searchList = [];
    //         let searchListone = [];
    //     if(str){
    //         this.filteredlst.forEach(key => {
    //             searchList.push({"label":key.label,"value":key.value,"checked":key.checked,"ind":key.ind});
    //         }); 
    //         searchList = this.compareFilter(str);
    //         // console.log('this.filteredlst--->after-->'+JSON.stringify(searchList));
    //         // let index = 0;
    //         // searchList.forEach(key => {
    //         //     searchListone.push({"label":key.label,"value":key.value,"checked":key.checked,"ind":index++});
    //         // });
    //         // console.log('this.filteredlst--->final-->'+JSON.stringify(searchListone));
    //         this.filteredlst = searchList;

    //     } else {

    //        this.filteredlst = this.MainOptionsLst;
    //     }
    //     return this.filteredlst;
    // }
    // compareFilter = (str) =>
    //     this.options.filter(data => (data.value.toLowerCase()).indexOf(str.toLowerCase()) !== -1);
    
    mainDispatchEvent(){
        const selectedValue = this.selectedValuesList;
        const selectedEvent = new CustomEvent("picklistvalueselected", {
            detail: selectedValue,
          });
          this.dispatchEvent(selectedEvent);
    }

    mainDispatchEventAura(){
        const selectedValue = this.selectedValuesList;
        const selectedEvent = new CustomEvent("picklistvalueselectedaura", {
            detail: {selectedValue},
          });
          this.dispatchEvent(selectedEvent);
    }

}
