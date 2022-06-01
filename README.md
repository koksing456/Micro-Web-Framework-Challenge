# Micro-Web-Framework-Challenge

![image](https://user-images.githubusercontent.com/70791269/170765200-3b8355e1-3864-4605-8201-4000f97b6184.png)
## When traffic is 5
*solution
The solution here is like a preparation before it gains high traffic
Order Lists:
  - Design a proper server architecture
  - Adopting cloud solution
    - virtual machines to handle excess traffic when the situation arises
    - scalable 
  - Adopting a scalable language and framework (nodejs)
  
  ## When traffic is 5k
*solution
1. Rate Limiting
To limit the requester that request the api service based on categories below:
  - Dynamic Limits
  - Server Rate Limits
  - Regional Data Limits
  
  ## When traffic is 100k
  When there is high traffic ie 100k, it will affects the security of the application ie CIA
  - Confidentiality - high traffic can cause exposure of sensitive data
  - Intergrity - may cause incomplete data transfer
  - Availability
- *solution
1. API gateway
2. Traffic Management Provider (cloudfare)

