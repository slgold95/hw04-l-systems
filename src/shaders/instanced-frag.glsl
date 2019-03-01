#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor; // normals

out vec4 out_Col;

void main()
{
vec3 n = fs_Nor.xyz;
vec3 lightVector = u_Eye;

// h is the average of the view and light vectors
vec3 h = (u_Eye + lightVector) / 2.0;
// specular intensity
float specularInt = max(pow(dot(normalize(h), normalize(n)), 23.0) , 0.0);  
// dot between normals and light direction
float diffuseTerm = dot(normalize(n), normalize(lightVector));  
// Avoid negative lighting values
diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);    
float ambientTerm = 0.2;
float lightIntensity = diffuseTerm + ambientTerm;

vec3 color = fs_Col.xyz * lightIntensity;
out_Col = vec4(clamp(color, 0.0, 1.0), 1.0); // stop colors from blowing out
}
