# TMEvaluationPlatform 
This repository contains a web-based evaluation platform that was designed
and implemented to provide an easy way of annotating data and gathering statistics
about the quality of the results obtained with the entity-based topic modeling pipeline that is avaiable for download here: https://github.com/anlausch/TMELPipeline.

In addition to the platform itself, the project folder contains a gold standard on three different datasets that was obtained thanks to the effort of three human annotators (annotations.zip).

Installation instructions:
- install MySQL
- install Node.js
- run the following command in the project folder: 
	npm install
- change database information in config.js according to your needs
- start the application:
  npm start
  
This project was part of the research that was done on Entity-based Topic Modeling by the Data and Web Science Research Group of the University of Mannheim. More information about our group can be found here:
http://dws.informatik.uni-mannheim.de/en/home/.

*Please do not forget to cite our work when using it in your project:*

Anne Lauscher, Federico Nanni, Pablo Ruiz Fabo and Simone Paolo Ponzetto (2016): [Entities as Topic Labels: Combining Entity Linking and Labeled LDA to Improve Topic Interpretability and Evaluability](http://www.ai-lc.it/IJCoL/v2n2/4-lauscher_et_al.pdf). In: Italian Journal of Computational Linguistics 2(2), pp. 67-88.

![](http://www.uni-mannheim.de/1/english/config/uni_ma_logo_engl.gif)
  
 
