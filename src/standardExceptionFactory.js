import StandardException from './StandardException';

export default function(aProperties) {

	// message=null,statusCode=null,inner=null,data
	return new StandardException(aProperties.message,aProperties.statusCode,aProperties.inner,aProperties.data);

};

