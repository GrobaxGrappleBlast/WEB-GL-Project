to run call npm run serve
if it fails remember to run npm install.
i have had cases where i need to call npm install three and npm install @types/three.
three is used for quarternion conversions

The file calls are implemented in a message bus pattern. with subscribers and notifiers. all concealed in the 
Loader/FileRequests.ts 

