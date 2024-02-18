const fragment = /* glsl */`

#ifdef GL_ES
  precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec3 u_sphere_pos[5];
uniform float u_time;
uniform vec3 u_mouse;

varying vec3 vPosition;

const vec3 LIGHT_POS = vec3(10.0, 10.0, -2.0);
const float HIT_DISTANCE = 0.01;
const int REFLECTS = 1;
const vec3 CENTER_COL = vec3(0.7, 0.6, 0.0);
const vec3 EDGE_COL = vec3(0.95, 0.0, 0.0);

float smoothMin(float a, float b, float k)
{
  return -log(exp(k * -a) + exp(k * -b)) / k;
}

float sphereSDF(vec3 point, vec3 origin, float radius)
{
  return length(point - origin) - radius;
}

float scene(vec3 point)
{
  float closest_distance = 10000.0;
  float temp = 0.0;
  float k = 2.0;

  for (int i = 0; i < 5; i++)
  {
    //float test_distance = sphereSDF(point, u_sphere_pos[i] + vec3(sin(u_time + float(i)), cos(u_time + float(i) + float(i) / 5.0), 0.0), 1.0);
    
    float test_distance = sphereSDF(point, u_mouse + vec3(3.0 * sin(u_time + float(i)), 3.0 * cos(u_time + float(i) + float(i) / 5.0), 0.0), 1.0);

    closest_distance = min(closest_distance, test_distance);

    temp += exp(k * -test_distance);

  }

  return -log(temp) / k;

  //return closest_distance;
}

vec3 calculateNormal(vec3 p)
{
  const vec3 small_step = vec3(0.001, 0.0, 0.0);

  float gradient_x = scene(p + small_step.xyy) - scene(p - small_step.xyy);
  float gradient_y = scene(p + small_step.yxy) - scene(p - small_step.yxy);
  float gradient_z = scene(p + small_step.yyx) - scene(p - small_step.yyx);

  vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

  return normalize(normal);
}

float diffuse(vec3 normal, vec3 lightDirection)
{
  return clamp(dot(normal, lightDirection), 0.0, 1.0);
}

vec3 get_color(vec3 normal, vec3 ray_direction)
{
  float lerp = abs(dot(normal, ray_direction));

  return (CENTER_COL * lerp) + (EDGE_COL * (1.0 - lerp));
}

vec3 reflect_march(vec3 rayOrigin, vec3 rayDirection)
{
  float rayDistance = 0.0;
  int maxMarches = 32;
  float closest_distance = 10000.0;
  
  for(int i = 0; i < maxMarches; i++)
  {
    vec3 pos = rayOrigin + rayDirection * rayDistance;

    //float test_distance = scene(pos);
    closest_distance = scene(pos);

    if (closest_distance <= HIT_DISTANCE)
    {
      vec3 normal = calculateNormal(pos);
      vec3 lightDirection = normalize(LIGHT_POS - pos);
      float diffuseScale = clamp(diffuse(normal, lightDirection), 0.2, 1.0);

      return CENTER_COL;
    }

    rayDistance += closest_distance;
  }
  
  return vec3(1.0, 1.0, 1.0);
}

vec3 raymarch(vec3 rayOrigin, vec3 rayDirection, out vec3 normal, out vec3 hit_pos)
{
  float rayDistance = 0.0;
  int maxMarches = 64;
  float closest_distance = 100000.0;
  
  for(int i = 0; i < maxMarches; i++)
  {
    hit_pos = rayOrigin + rayDirection * rayDistance;
    float dist = 100000.0;

    //float test_distance = scene(pos);
    dist = scene(hit_pos);
    closest_distance = min(closest_distance, dist);

    if (dist <= HIT_DISTANCE)
    {
      normal = calculateNormal(hit_pos);
      vec3 lightDirection = normalize(LIGHT_POS - hit_pos);
      float diffuseScale = clamp(diffuse(normal, lightDirection), 0.2, 1.0);
      
      //vec3 col = vec3(1.0, 0.0, 0.0);
      //col = reflect_march(pos + (normal * 0.1) , normal);

      //return ((vec3(1.0, 0.0, 0.0) * 0.6) + (col * 0.4)) * diffuseScale;
      return get_color(normal, rayDirection) * diffuseScale;
    }

    rayDistance += dist;
  }

  float lerp = 1.0 - (min(closest_distance, 0.5) / 0.5);
  
  return EDGE_COL * lerp;
}

vec3 raymarch(vec3 rayOrigin, vec3 rayDirection)
{
  vec3 normal, hit_pos;
  vec3 col = raymarch(rayOrigin, rayDirection, normal, hit_pos);
  return col;
}

void main() 
{
  vec2 uv = vPosition.xy;
  uv.x = uv.x * (u_resolution.x / u_resolution.y);

  vec3 rayOrigin = vec3(0, 0, -4);
  vec3 rayDirection = vec3(uv, 0) - rayOrigin;
  rayDirection = rayDirection / length(rayDirection);

  vec4 col;// = vec4(raymarch(rayOrigin, rayDirection, normal, hit_pos), 1.0);
  for (int i = 0; i < 1; i++)
  {
    col += vec4(raymarch(rayOrigin, rayDirection, rayDirection, rayOrigin), 1.0);
  }

  gl_FragColor = vec4(col);
}

`;
export default fragment;