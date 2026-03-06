import type { Cert } from '../types';

export const CERTS_DATA: Cert[] = [
  // ─── CompTIA Security+ ───────────────────────────────────────────────────
  {
    id: 'security-plus',
    name: 'CompTIA Security+',
    vendor: 'CompTIA',
    color: '#e74c3c',
    domains: [
      {
        id: 'sp-d1',
        certId: 'security-plus',
        name: 'General Security Concepts',
        weight: 12,
        objectives: [
          {
            id: 'sp-1.1',
            domainId: 'sp-d1',
            certId: 'security-plus',
            code: '1.1',
            title: 'Compare and contrast various types of security controls',
            description:
              'Understand categories (technical, managerial, operational, physical) and types (preventive, detective, corrective, deterrent, compensating, directive).',
            keywords: ['security controls', 'preventive', 'detective', 'corrective', 'technical', 'managerial', 'physical', 'operational'],
          },
          {
            id: 'sp-1.2',
            domainId: 'sp-d1',
            certId: 'security-plus',
            code: '1.2',
            title: 'Summarize fundamental security concepts',
            description:
              'CIA Triad, non-repudiation, authentication, authorization, accounting (AAA), gap analysis, zero trust, physical security.',
            keywords: ['CIA triad', 'confidentiality', 'integrity', 'availability', 'AAA', 'zero trust', 'non-repudiation'],
          },
          {
            id: 'sp-1.3',
            domainId: 'sp-d1',
            certId: 'security-plus',
            code: '1.3',
            title: 'Explain the importance of change management processes and security impacts',
            description:
              'Change approval, sandboxing, test environments, legacy systems, dependencies, documentation, version control.',
            keywords: ['change management', 'change control', 'sandbox', 'version control', 'legacy'],
          },
          {
            id: 'sp-1.4',
            domainId: 'sp-d1',
            certId: 'security-plus',
            code: '1.4',
            title: 'Explain the importance of using appropriate cryptographic solutions',
            description:
              'Symmetric vs asymmetric, PKI, hashing, digital signatures, certificates, key exchange, obfuscation, steganography.',
            keywords: ['cryptography', 'PKI', 'symmetric', 'asymmetric', 'hashing', 'digital signature', 'certificate', 'TLS', 'AES', 'RSA'],
          },
        ],
      },
      {
        id: 'sp-d2',
        certId: 'security-plus',
        name: 'Threats, Vulnerabilities & Mitigations',
        weight: 22,
        objectives: [
          {
            id: 'sp-2.1',
            domainId: 'sp-d2',
            certId: 'security-plus',
            code: '2.1',
            title: 'Compare and contrast common threat actors and motivations',
            description:
              'Nation-state, unskilled attacker, hacktivist, insider threat, organized crime. Motivations: data exfiltration, financial, espionage, disruption.',
            keywords: ['threat actor', 'nation-state', 'insider threat', 'hacktivist', 'APT', 'motivation'],
          },
          {
            id: 'sp-2.2',
            domainId: 'sp-d2',
            certId: 'security-plus',
            code: '2.2',
            title: 'Explain common threat vectors and attack surfaces',
            description:
              'Message-based, image-based, file-based, voice call, removable device, supply chain, social engineering, unsecured networks.',
            keywords: ['attack vector', 'attack surface', 'phishing', 'social engineering', 'supply chain', 'removable media'],
          },
          {
            id: 'sp-2.3',
            domainId: 'sp-d2',
            certId: 'security-plus',
            code: '2.3',
            title: 'Explain various types of vulnerabilities',
            description:
              'Application (memory injection, buffer overflow, race conditions, SQL injection, XSS, CSRF), OS, web-based, hardware, virtualization, cloud, supply chain, cryptographic, misconfiguration.',
            keywords: ['vulnerability', 'buffer overflow', 'SQL injection', 'XSS', 'CSRF', 'race condition', 'misconfiguration', 'CVE'],
          },
          {
            id: 'sp-2.4',
            domainId: 'sp-d2',
            certId: 'security-plus',
            code: '2.4',
            title: 'Analyze indicators of malicious activity',
            description:
              'Malware types (ransomware, trojan, worm, spyware, bloatware, virus, keylogger, logic bomb, rootkit), network IoCs, application IoCs, behavioral IoCs.',
            keywords: ['malware', 'ransomware', 'trojan', 'worm', 'rootkit', 'keylogger', 'IOC', 'indicator of compromise'],
          },
          {
            id: 'sp-2.5',
            domainId: 'sp-d2',
            certId: 'security-plus',
            code: '2.5',
            title: 'Explain the purpose of mitigation techniques used to secure the enterprise',
            description:
              'Segmentation, access control, application allow list, patching, encryption, monitoring, least privilege, configuration enforcement, decommissioning, hardening.',
            keywords: ['mitigation', 'segmentation', 'least privilege', 'patching', 'hardening', 'allowlisting', 'monitoring'],
          },
        ],
      },
      {
        id: 'sp-d3',
        certId: 'security-plus',
        name: 'Security Architecture',
        weight: 18,
        objectives: [
          {
            id: 'sp-3.1',
            domainId: 'sp-d3',
            certId: 'security-plus',
            code: '3.1',
            title: 'Compare and contrast security implications of different architecture models',
            description:
              'Cloud (IaaS, PaaS, SaaS, responsibility matrix), serverless, microservices, on-premises, hybrid, network infrastructure (SDN, SASE).',
            keywords: ['cloud', 'IaaS', 'PaaS', 'SaaS', 'shared responsibility', 'serverless', 'microservices', 'hybrid', 'SASE', 'SDN'],
          },
          {
            id: 'sp-3.2',
            domainId: 'sp-d3',
            certId: 'security-plus',
            code: '3.2',
            title: 'Apply security principles to secure enterprise infrastructure',
            description:
              'Infrastructure considerations, network appliances (jump server, proxy, IDS/IPS, WAF, firewall, NGFW), port security, secure protocols, email security (DMARC, DKIM, SPF).',
            keywords: ['firewall', 'IDS', 'IPS', 'WAF', 'proxy', 'jump server', 'DMARC', 'DKIM', 'SPF', 'NGFW', 'DMZ'],
          },
          {
            id: 'sp-3.3',
            domainId: 'sp-d3',
            certId: 'security-plus',
            code: '3.3',
            title: 'Compare and contrast concepts and strategies to protect data',
            description:
              'Data types, data classifications, data states (at rest, in transit, in use), data sovereignty, geographic restrictions, encryption, hashing, masking, tokenization, DLP, rights management.',
            keywords: ['data classification', 'data at rest', 'data in transit', 'DLP', 'tokenization', 'masking', 'encryption', 'data sovereignty'],
          },
          {
            id: 'sp-3.4',
            domainId: 'sp-d3',
            certId: 'security-plus',
            code: '3.4',
            title: 'Explain the importance of resilience and recovery in security architecture',
            description:
              'High availability, site considerations (hot/warm/cold), platform diversity, multicloud, continuity of operations, capacity planning, testing (tabletop, failover, simulation), backups, power.',
            keywords: ['high availability', 'disaster recovery', 'hot site', 'warm site', 'cold site', 'RTO', 'RPO', 'backup', 'MTTR', 'MTBF'],
          },
        ],
      },
      {
        id: 'sp-d4',
        certId: 'security-plus',
        name: 'Security Operations',
        weight: 28,
        objectives: [
          {
            id: 'sp-4.1',
            domainId: 'sp-d4',
            certId: 'security-plus',
            code: '4.1',
            title: 'Apply common security techniques to computing resources',
            description:
              'Secure baselines, hardening (OS, applications, endpoints), wireless security (WPA3, AAA, RADIUS), mobile (MDM, MAM, UEM), patch management, encryption.',
            keywords: ['baseline', 'hardening', 'MDM', 'patch management', 'WPA3', 'RADIUS', 'endpoint security', 'UEM'],
          },
          {
            id: 'sp-4.2',
            domainId: 'sp-d4',
            certId: 'security-plus',
            code: '4.2',
            title: 'Explain the security implications of proper hardware, software, and data asset management',
            description:
              'Asset inventory, asset tagging, enumeration, disposal (data sanitization, destruction), MDM, media sanitization, certificate management.',
            keywords: ['asset management', 'inventory', 'data sanitization', 'disposal', 'degaussing', 'certificate lifecycle'],
          },
          {
            id: 'sp-4.3',
            domainId: 'sp-d4',
            certId: 'security-plus',
            code: '4.3',
            title: 'Explain various activities associated with vulnerability management',
            description:
              'Identification, remediation, CVSS scoring, CVE, CVSS vectors, vulnerability scanning, penetration testing, threat intelligence, OSINT.',
            keywords: ['vulnerability management', 'CVSS', 'CVE', 'vulnerability scan', 'penetration test', 'threat intelligence', 'OSINT', 'remediation'],
          },
          {
            id: 'sp-4.4',
            domainId: 'sp-d4',
            certId: 'security-plus',
            code: '4.4',
            title: 'Explain security alerting and monitoring concepts and tools',
            description:
              'SIEM, SOAR, log aggregation, NetFlow, DLP, endpoint detection and response (EDR), SNMP traps, syslog, threat feeds.',
            keywords: ['SIEM', 'SOAR', 'EDR', 'log management', 'NetFlow', 'syslog', 'SNMP', 'monitoring', 'alerting', 'threat feed'],
          },
          {
            id: 'sp-4.5',
            domainId: 'sp-d4',
            certId: 'security-plus',
            code: '4.5',
            title: 'Modify enterprise capabilities to enhance security',
            description:
              'Firewall rules, IDS/IPS tuning, DLP, NAC, EDR, user behavior analytics (UEBA), allow/block lists, DNS filtering.',
            keywords: ['firewall rules', 'NAC', 'UEBA', 'DNS filtering', 'allow list', 'block list', 'IDS tuning'],
          },
          {
            id: 'sp-4.6',
            domainId: 'sp-d4',
            certId: 'security-plus',
            code: '4.6',
            title: 'Implement and maintain identity and access management',
            description:
              'Provisioning, permission assignments, identity proofing, federation, SSO, MFA, PAM, password policies, RBAC, ABAC, time-of-day restrictions.',
            keywords: ['IAM', 'MFA', 'SSO', 'federation', 'RBAC', 'ABAC', 'PAM', 'privileged access', 'provisioning', 'LDAP', 'Kerberos'],
          },
          {
            id: 'sp-4.7',
            domainId: 'sp-d4',
            certId: 'security-plus',
            code: '4.7',
            title: 'Explain the importance of automation and orchestration related to secure operations',
            description:
              'Use cases (user/resource provisioning, ticket creation, escalation, API integration), benefits and risks of automation, SOAR playbooks.',
            keywords: ['automation', 'orchestration', 'SOAR', 'playbook', 'API', 'CI/CD security'],
          },
          {
            id: 'sp-4.8',
            domainId: 'sp-d4',
            certId: 'security-plus',
            code: '4.8',
            title: 'Explain appropriate incident response activities',
            description:
              'Incident response process (prepare, detect, analyze, contain, eradicate, recover, post-incident), digital forensics, chain of custody, legal hold.',
            keywords: ['incident response', 'IR', 'forensics', 'chain of custody', 'containment', 'eradication', 'recovery', 'PICERL'],
          },
          {
            id: 'sp-4.9',
            domainId: 'sp-d4',
            certId: 'security-plus',
            code: '4.9',
            title: 'Use data sources to support an investigation',
            description:
              'Log data types (firewall, application, endpoint, OS, IPS/IDS, network, metadata), SIEM dashboards, NetFlow, packet captures.',
            keywords: ['logs', 'log analysis', 'packet capture', 'PCAP', 'NetFlow', 'SIEM', 'metadata', 'investigation'],
          },
        ],
      },
      {
        id: 'sp-d5',
        certId: 'security-plus',
        name: 'Security Program Management & Oversight',
        weight: 20,
        objectives: [
          {
            id: 'sp-5.1',
            domainId: 'sp-d5',
            certId: 'security-plus',
            code: '5.1',
            title: 'Summarize elements of effective security governance',
            description:
              'Guidelines, policies, standards, procedures, regulations, external considerations, monitoring and revision, types of governance structures.',
            keywords: ['governance', 'policy', 'standards', 'procedures', 'regulations', 'compliance', 'risk management'],
          },
          {
            id: 'sp-5.2',
            domainId: 'sp-d5',
            certId: 'security-plus',
            code: '5.2',
            title: 'Explain elements of the risk management process',
            description:
              'Risk identification, risk analysis (qualitative/quantitative), risk register, risk tolerance, risk appetite, risk management strategies (transfer, accept, avoid, mitigate).',
            keywords: ['risk management', 'risk assessment', 'qualitative', 'quantitative', 'risk register', 'risk appetite', 'ALE', 'SLE', 'ARO'],
          },
          {
            id: 'sp-5.3',
            domainId: 'sp-d5',
            certId: 'security-plus',
            code: '5.3',
            title: 'Explain the processes associated with third-party risk assessment and management',
            description:
              'Vendor assessment, penetration testing rules of engagement, right-to-audit clauses, supply chain analysis, due diligence, contracts (SLA, NDA, MOA, MOU, MSA).',
            keywords: ['third-party risk', 'vendor assessment', 'supply chain', 'SLA', 'NDA', 'due diligence', 'right to audit'],
          },
          {
            id: 'sp-5.4',
            domainId: 'sp-d5',
            certId: 'security-plus',
            code: '5.4',
            title: 'Summarize elements of effective security compliance',
            description:
              'Compliance reporting, monitoring (internal/external), privacy (data subject rights, retention, PII/PHI/sensitive data), legal implications.',
            keywords: ['compliance', 'GDPR', 'HIPAA', 'PCI-DSS', 'privacy', 'PII', 'PHI', 'data retention'],
          },
          {
            id: 'sp-5.5',
            domainId: 'sp-d5',
            certId: 'security-plus',
            code: '5.5',
            title: 'Explain types and purposes of audits and assessments',
            description:
              'Attestation, internal/external audits, penetration testing (physical, offensive, defensive, integrated, reconnaissance), vulnerability assessments.',
            keywords: ['audit', 'assessment', 'penetration testing', 'attestation', 'compliance audit', 'vulnerability assessment'],
          },
          {
            id: 'sp-5.6',
            domainId: 'sp-d5',
            certId: 'security-plus',
            code: '5.6',
            title: 'Implement security awareness practices',
            description:
              'Phishing campaigns, phishing simulations, security training, user guidance (policy/handbooks), reporting threats, anomalous behavior recognition, insider threat awareness.',
            keywords: ['security awareness', 'phishing simulation', 'training', 'user behavior', 'insider threat', 'social engineering awareness'],
          },
        ],
      },
    ],
  },

  // ─── CompTIA Network+ ────────────────────────────────────────────────────
  {
    id: 'network-plus',
    name: 'CompTIA Network+',
    vendor: 'CompTIA',
    color: '#3498db',
    domains: [
      {
        id: 'np-d1',
        certId: 'network-plus',
        name: 'Networking Concepts',
        weight: 23,
        objectives: [
          {
            id: 'np-1.1',
            domainId: 'np-d1',
            certId: 'network-plus',
            code: '1.1',
            title: 'Explain concepts related to the OSI model',
            description:
              'Layer functions (physical, data link, network, transport, session, presentation, application), encapsulation/decapsulation, PDU names.',
            keywords: ['OSI model', 'layers', 'encapsulation', 'PDU', 'frame', 'packet', 'segment'],
          },
          {
            id: 'np-1.2',
            domainId: 'np-d1',
            certId: 'network-plus',
            code: '1.2',
            title: 'Compare and contrast networking appliances, applications, and functions',
            description:
              'Physical and virtual: router, switch, firewall, IDS/IPS, load balancer, proxy, content filter, VPN gateway, access point.',
            keywords: ['router', 'switch', 'firewall', 'load balancer', 'proxy', 'VPN', 'access point', 'IDS', 'IPS'],
          },
          {
            id: 'np-1.3',
            domainId: 'np-d1',
            certId: 'network-plus',
            code: '1.3',
            title: 'Summarize cloud concepts and connectivity options',
            description:
              'Service models (IaaS, PaaS, SaaS), deployment models (public, private, hybrid, community), connectivity (VPN, Direct Connect, colocation).',
            keywords: ['cloud', 'IaaS', 'PaaS', 'SaaS', 'public cloud', 'private cloud', 'hybrid cloud', 'VPN', 'Direct Connect'],
          },
          {
            id: 'np-1.4',
            domainId: 'np-d1',
            certId: 'network-plus',
            code: '1.4',
            title: 'Explain common networking ports, protocols, services, and traffic types',
            description:
              'Well-known ports (FTP 21, SSH 22, Telnet 23, SMTP 25, DNS 53, HTTP 80, HTTPS 443, etc.), TCP vs UDP, protocols (DNS, DHCP, NTP, SNMP, LDAP, Kerberos).',
            keywords: ['ports', 'protocols', 'TCP', 'UDP', 'DNS', 'DHCP', 'HTTP', 'HTTPS', 'SSH', 'FTP', 'SMTP', 'SNMP', 'NTP'],
          },
          {
            id: 'np-1.5',
            domainId: 'np-d1',
            certId: 'network-plus',
            code: '1.5',
            title: 'Compare and contrast transmission media and transceivers',
            description:
              'Copper (Cat 5e, Cat 6, Cat 6A, coaxial), fiber (single-mode, multi-mode), transceivers (SFP, QSFP), plenum vs riser vs outdoor.',
            keywords: ['copper', 'fiber', 'Cat6', 'single-mode', 'multi-mode', 'SFP', 'transceiver', 'plenum', 'coaxial'],
          },
          {
            id: 'np-1.6',
            domainId: 'np-d1',
            certId: 'network-plus',
            code: '1.6',
            title: 'Compare and contrast network topologies, architectures, and types',
            description:
              'Star, mesh, bus, ring, hybrid topologies. Three-tier (access/distribution/core), spine-leaf, SOHO, point-to-point, WAN architectures.',
            keywords: ['topology', 'star', 'mesh', 'ring', 'bus', 'spine-leaf', 'three-tier', 'SOHO', 'WAN'],
          },
          {
            id: 'np-1.7',
            domainId: 'np-d1',
            certId: 'network-plus',
            code: '1.7',
            title: 'Explain the basics of wireless networking',
            description:
              '802.11 standards (a/b/g/n/ac/ax), channels, SSID, BSS/ESS, antenna types, WAP placement, frequency bands (2.4GHz, 5GHz, 6GHz).',
            keywords: ['wireless', '802.11', 'WiFi', '2.4GHz', '5GHz', 'SSID', 'antenna', 'channel', 'WAP', 'WPA3'],
          },
          {
            id: 'np-1.8',
            domainId: 'np-d1',
            certId: 'network-plus',
            code: '1.8',
            title: 'Summarize emerging networking technologies',
            description:
              'SD-WAN, SASE, SD-Access, virtual network functions (VNF), intent-based networking, AI/ML in networking.',
            keywords: ['SD-WAN', 'SASE', 'SDN', 'VNF', 'intent-based networking', 'AI networking'],
          },
        ],
      },
      {
        id: 'np-d2',
        certId: 'network-plus',
        name: 'Network Implementation',
        weight: 19,
        objectives: [
          {
            id: 'np-2.1',
            domainId: 'np-d2',
            certId: 'network-plus',
            code: '2.1',
            title: 'Compare and contrast various addressing technologies and schemes',
            description:
              'IPv4 (classful, CIDR, subnetting, VLSM), IPv6 (addressing, types, EUI-64, dual-stack, tunneling), NAT/PAT, APIPA, DHCP scopes.',
            keywords: ['IPv4', 'IPv6', 'subnetting', 'CIDR', 'VLSM', 'NAT', 'PAT', 'DHCP', 'APIPA', 'dual-stack'],
          },
          {
            id: 'np-2.2',
            domainId: 'np-d2',
            certId: 'network-plus',
            code: '2.2',
            title: 'Compare and contrast routing technologies and bandwidth management concepts',
            description:
              'Dynamic routing (OSPF, EIGRP, BGP, RIP), static routing, route redistribution, administrative distance, QoS, traffic shaping, traffic policing.',
            keywords: ['routing', 'OSPF', 'BGP', 'EIGRP', 'RIP', 'static route', 'QoS', 'traffic shaping', 'administrative distance'],
          },
          {
            id: 'np-2.3',
            domainId: 'np-d2',
            certId: 'network-plus',
            code: '2.3',
            title: 'Configure and deploy common Ethernet switching features',
            description:
              'VLANs, trunking (802.1Q), STP (RSTP), link aggregation (LACP), PoE, port mirroring, VLAN configuration, voice VLANs.',
            keywords: ['VLAN', '802.1Q', 'trunking', 'STP', 'RSTP', 'LACP', 'PoE', 'port mirroring', 'switching'],
          },
          {
            id: 'np-2.4',
            domainId: 'np-d2',
            certId: 'network-plus',
            code: '2.4',
            title: 'Install and configure the appropriate wireless technologies and configurations',
            description:
              'WPA2/WPA3, EAP methods, RADIUS integration, channel planning, site survey, heat maps, interference, roaming (BSS transition, band steering).',
            keywords: ['WPA2', 'WPA3', 'EAP', 'RADIUS', 'channel plan', 'site survey', 'wireless security', 'heat map'],
          },
        ],
      },
      {
        id: 'np-d3',
        certId: 'network-plus',
        name: 'Network Operations',
        weight: 17,
        objectives: [
          {
            id: 'np-3.1',
            domainId: 'np-d3',
            certId: 'network-plus',
            code: '3.1',
            title: 'Explain the purpose of organizational documents and policies',
            description:
              'Plans (DR, BCP, incident), policies (acceptable use, NDA, MOU), diagrams (physical, logical, rack), standard operating procedures.',
            keywords: ['SOP', 'policy', 'disaster recovery', 'BCP', 'NDA', 'MOU', 'network diagram', 'acceptable use'],
          },
          {
            id: 'np-3.2',
            domainId: 'np-d3',
            certId: 'network-plus',
            code: '3.2',
            title: 'Compare and contrast business continuity and disaster recovery concepts',
            description:
              'RTO, RPO, MTTR, MTBF, high availability, redundancy, cold/warm/hot sites, backups, replication, failover.',
            keywords: ['BCP', 'DR', 'RTO', 'RPO', 'MTTR', 'MTBF', 'hot site', 'cold site', 'failover', 'redundancy'],
          },
          {
            id: 'np-3.3',
            domainId: 'np-d3',
            certId: 'network-plus',
            code: '3.3',
            title: 'Use the appropriate statistics and sensors to ensure network availability',
            description:
              'SNMP, NetFlow/IPFIX, syslog, interface statistics (error rates, utilization), environmental sensors, ICMP, bandwidth monitoring.',
            keywords: ['SNMP', 'NetFlow', 'syslog', 'interface stats', 'bandwidth', 'monitoring', 'availability'],
          },
          {
            id: 'np-3.4',
            domainId: 'np-d3',
            certId: 'network-plus',
            code: '3.4',
            title: 'Explain common scanning, monitoring, and patching processes',
            description:
              'Process: discovery, scanning, patching, firmware updates, rollback, maintenance window, vulnerability scanning, log review.',
            keywords: ['scanning', 'patching', 'firmware', 'vulnerability scan', 'rollback', 'maintenance window'],
          },
          {
            id: 'np-3.5',
            domainId: 'np-d3',
            certId: 'network-plus',
            code: '3.5',
            title: 'Summarize the use of remote access methods',
            description:
              'VPN types (IPSec, SSL/TLS, split tunnel, full tunnel), RADIUS, TACACS+, out-of-band management, jump servers, bastion hosts.',
            keywords: ['VPN', 'remote access', 'IPSec', 'SSL VPN', 'RADIUS', 'TACACS+', 'jump server', 'bastion host', 'split tunnel'],
          },
        ],
      },
      {
        id: 'np-d4',
        certId: 'network-plus',
        name: 'Network Security',
        weight: 20,
        objectives: [
          {
            id: 'np-4.1',
            domainId: 'np-d4',
            certId: 'network-plus',
            code: '4.1',
            title: 'Explain the importance of basic network security concepts',
            description:
              'Physical security, logical security, defense in depth, zero trust, network segmentation, AAA, least privilege, PKI fundamentals.',
            keywords: ['network security', 'defense in depth', 'zero trust', 'segmentation', 'AAA', 'least privilege', 'PKI'],
          },
          {
            id: 'np-4.2',
            domainId: 'np-d4',
            certId: 'network-plus',
            code: '4.2',
            title: 'Summarize various types of attacks and their impact on the network',
            description:
              'DoS/DDoS, MITM, ARP poisoning, VLAN hopping, MAC flooding, DNS poisoning, evil twin, rogue AP, deauthentication.',
            keywords: ['DDoS', 'DoS', 'MITM', 'ARP poisoning', 'VLAN hopping', 'MAC flooding', 'DNS poisoning', 'rogue AP', 'evil twin'],
          },
          {
            id: 'np-4.3',
            domainId: 'np-d4',
            certId: 'network-plus',
            code: '4.3',
            title: 'Apply network hardening techniques',
            description:
              'DHCP snooping, dynamic ARP inspection, port security, 802.1X, disable unused ports, VLAN management, ACLs, securing SNMP.',
            keywords: ['hardening', 'DHCP snooping', 'DAI', 'port security', '802.1X', 'ACL', 'SNMP security'],
          },
          {
            id: 'np-4.4',
            domainId: 'np-d4',
            certId: 'network-plus',
            code: '4.4',
            title: 'Compare and contrast remote access security methods and capabilities',
            description:
              'MFA for VPN, certificate-based auth, VPN concentrators, ZTNA, clientless vs client-based VPN.',
            keywords: ['remote access', 'MFA', 'VPN', 'certificate auth', 'ZTNA', 'zero trust network access'],
          },
          {
            id: 'np-4.5',
            domainId: 'np-d4',
            certId: 'network-plus',
            code: '4.5',
            title: 'Explain the importance of physical security',
            description:
              'Perimeter security, badges, locks, biometrics, cameras, sensors, environmental controls, secure areas (data center, wiring closets).',
            keywords: ['physical security', 'biometrics', 'badge', 'camera', 'environmental control', 'data center', 'wiring closet'],
          },
        ],
      },
      {
        id: 'np-d5',
        certId: 'network-plus',
        name: 'Network Troubleshooting',
        weight: 21,
        objectives: [
          {
            id: 'np-5.1',
            domainId: 'np-d5',
            certId: 'network-plus',
            code: '5.1',
            title: 'Explain the network troubleshooting methodology',
            description:
              'Identify, establish theory, test theory, plan action, implement, verify, document. OSI layer approach, divide and conquer.',
            keywords: ['troubleshooting', 'methodology', 'OSI approach', 'divide and conquer', 'documentation'],
          },
          {
            id: 'np-5.2',
            domainId: 'np-d5',
            certId: 'network-plus',
            code: '5.2',
            title: 'Troubleshoot common cable connectivity issues and select appropriate tools',
            description:
              'Cable testers, wire maps, TDR, OTDR, tone generator, light meter, loopback adapters, attenuation, crosstalk, signal-to-noise ratio.',
            keywords: ['cable', 'TDR', 'OTDR', 'cable tester', 'tone generator', 'attenuation', 'crosstalk'],
          },
          {
            id: 'np-5.3',
            domainId: 'np-d5',
            certId: 'network-plus',
            code: '5.3',
            title: 'Use the appropriate network software tools and commands',
            description:
              'ping, traceroute, tracert, nslookup, dig, ipconfig/ifconfig, netstat, nmap, route, arp, Wireshark, tcpdump, iperf.',
            keywords: ['ping', 'traceroute', 'nslookup', 'dig', 'netstat', 'nmap', 'Wireshark', 'tcpdump', 'iperf', 'arp'],
          },
          {
            id: 'np-5.4',
            domainId: 'np-d5',
            certId: 'network-plus',
            code: '5.4',
            title: 'Troubleshoot common wireless connectivity issues',
            description:
              'Interference, signal strength, channel overlap, authentication failures, SSID mismatch, hidden SSID, frequency mismatch, antenna alignment.',
            keywords: ['wireless troubleshooting', 'interference', 'signal strength', 'channel overlap', 'SSID', 'authentication failure'],
          },
          {
            id: 'np-5.5',
            domainId: 'np-d5',
            certId: 'network-plus',
            code: '5.5',
            title: 'Troubleshoot general networking issues',
            description:
              'Collisions, broadcast storms, duplicate IP/MAC, asymmetric routing, switching loops, routing protocol issues, MTU mismatch, VLAN mismatch.',
            keywords: ['broadcast storm', 'duplicate IP', 'routing issue', 'switching loop', 'MTU', 'VLAN mismatch'],
          },
        ],
      },
    ],
  },

  // ─── CompTIA CySA+ ───────────────────────────────────────────────────────
  {
    id: 'cysa-plus',
    name: 'CompTIA CySA+',
    vendor: 'CompTIA',
    color: '#9b59b6',
    domains: [
      {
        id: 'cysa-d1',
        certId: 'cysa-plus',
        name: 'Security Operations',
        weight: 33,
        objectives: [
          {
            id: 'cysa-1.1',
            domainId: 'cysa-d1',
            certId: 'cysa-plus',
            code: '1.1',
            title: 'Explain the importance of system and network architecture concepts in security operations',
            description:
              'Log ingestion, asset inventory, SIEM architecture, network segmentation, UEBA, threat intelligence feeds, endpoint telemetry.',
            keywords: ['SIEM', 'log ingestion', 'asset inventory', 'UEBA', 'threat intelligence', 'network segmentation'],
          },
          {
            id: 'cysa-1.2',
            domainId: 'cysa-d1',
            certId: 'cysa-plus',
            code: '1.2',
            title: 'Given a scenario, analyze indicators of potentially malicious activity',
            description:
              'Network IoCs (unusual traffic, beaconing, DNS anomalies), host IoCs (registry changes, file system anomalies), account anomalies.',
            keywords: ['IOC', 'indicators of compromise', 'beaconing', 'DNS anomaly', 'registry', 'malicious activity'],
          },
          {
            id: 'cysa-1.3',
            domainId: 'cysa-d1',
            certId: 'cysa-plus',
            code: '1.3',
            title: 'Given a scenario, use appropriate tools or techniques to determine malicious activity',
            description:
              'Packet analysis, log analysis, sandboxing, threat hunting, OSINT, vulnerability databases, threat feeds.',
            keywords: ['packet analysis', 'log analysis', 'sandboxing', 'threat hunting', 'OSINT', 'threat feed'],
          },
        ],
      },
      {
        id: 'cysa-d2',
        certId: 'cysa-plus',
        name: 'Vulnerability Management',
        weight: 30,
        objectives: [
          {
            id: 'cysa-2.1',
            domainId: 'cysa-d2',
            certId: 'cysa-plus',
            code: '2.1',
            title: 'Given a scenario, implement vulnerability scanning methods and concepts',
            description:
              'Asset discovery, special considerations (cloud, OT, ICS, SCADA), vulnerability scanning tools, credentialed vs non-credentialed scans.',
            keywords: ['vulnerability scanning', 'asset discovery', 'credentialed scan', 'ICS', 'SCADA', 'cloud scanning'],
          },
          {
            id: 'cysa-2.2',
            domainId: 'cysa-d2',
            certId: 'cysa-plus',
            code: '2.2',
            title: 'Given a scenario, analyze output from vulnerability assessment tools',
            description:
              'CVSS scores, vulnerability scanner output, SAST/DAST results, threat intelligence correlation, false positives.',
            keywords: ['CVSS', 'SAST', 'DAST', 'vulnerability report', 'false positive', 'threat correlation'],
          },
          {
            id: 'cysa-2.3',
            domainId: 'cysa-d2',
            certId: 'cysa-plus',
            code: '2.3',
            title: 'Given a scenario, analyze data to prioritize vulnerabilities',
            description:
              'CVSS v3/v4, exploitability, asset criticality, exposure, risk-based prioritization, compensating controls.',
            keywords: ['vulnerability prioritization', 'CVSS', 'asset criticality', 'exploitability', 'risk-based', 'compensating control'],
          },
        ],
      },
      {
        id: 'cysa-d3',
        certId: 'cysa-plus',
        name: 'Incident Response & Management',
        weight: 20,
        objectives: [
          {
            id: 'cysa-3.1',
            domainId: 'cysa-d3',
            certId: 'cysa-plus',
            code: '3.1',
            title: 'Explain concepts related to attack methodology frameworks',
            description:
              'MITRE ATT&CK, Cyber Kill Chain, Diamond Model, threat modeling, adversary emulation.',
            keywords: ['MITRE ATT&CK', 'Kill Chain', 'Diamond Model', 'threat modeling', 'adversary emulation', 'TTPs'],
          },
          {
            id: 'cysa-3.2',
            domainId: 'cysa-d3',
            certId: 'cysa-plus',
            code: '3.2',
            title: 'Given a scenario, perform incident response activities',
            description:
              'Detection, containment, eradication, recovery, post-incident review, forensic preservation, chain of custody.',
            keywords: ['incident response', 'containment', 'eradication', 'forensics', 'chain of custody', 'post-incident'],
          },
        ],
      },
      {
        id: 'cysa-d4',
        certId: 'cysa-plus',
        name: 'Reporting & Communication',
        weight: 17,
        objectives: [
          {
            id: 'cysa-4.1',
            domainId: 'cysa-d4',
            certId: 'cysa-plus',
            code: '4.1',
            title: 'Explain the importance of vulnerability management reporting and communication',
            description:
              'Vulnerability report components, SLA adherence, risk acceptance, inhibitors to remediation, metrics and KPIs.',
            keywords: ['reporting', 'vulnerability report', 'SLA', 'risk acceptance', 'KPI', 'metrics'],
          },
          {
            id: 'cysa-4.2',
            domainId: 'cysa-d4',
            certId: 'cysa-plus',
            code: '4.2',
            title: 'Explain the importance of incident response reporting and communication',
            description:
              'Incident report, executive summary, lessons learned, stakeholder communication, regulatory notification, evidence handling.',
            keywords: ['incident report', 'lessons learned', 'stakeholder', 'regulatory notification', 'evidence'],
          },
        ],
      },
    ],
  },

  // ─── CompTIA PenTest+ ───────────────────────────────────────────────────
  {
    id: 'pentest-plus',
    name: 'CompTIA PenTest+',
    vendor: 'CompTIA',
    color: '#e67e22',
    domains: [
      {
        id: 'pt-d1',
        certId: 'pentest-plus',
        name: 'Planning & Scoping',
        weight: 14,
        objectives: [
          {
            id: 'pt-1.1',
            domainId: 'pt-d1',
            certId: 'pentest-plus',
            code: '1.1',
            title: 'Compare and contrast governance, risk, and compliance concepts',
            description:
              'Regulatory compliance, risk management in pen testing, scope restrictions, legal considerations, rules of engagement.',
            keywords: ['governance', 'risk', 'compliance', 'rules of engagement', 'scope', 'legal', 'authorization'],
          },
          {
            id: 'pt-1.2',
            domainId: 'pt-d1',
            certId: 'pentest-plus',
            code: '1.2',
            title: 'Explain the importance of scoping and organizational/customer requirements',
            description:
              'Scope definition, impact analysis, target list, disclaimers, contracts (SOW, NDA, MSA), compliance requirements.',
            keywords: ['scope', 'SOW', 'NDA', 'target list', 'impact analysis', 'contract'],
          },
        ],
      },
      {
        id: 'pt-d2',
        certId: 'pentest-plus',
        name: 'Information Gathering & Vulnerability Scanning',
        weight: 22,
        objectives: [
          {
            id: 'pt-2.1',
            domainId: 'pt-d2',
            certId: 'pentest-plus',
            code: '2.1',
            title: 'Given a scenario, perform passive reconnaissance',
            description:
              'OSINT techniques, DNS enumeration, WHOIS, social media, job postings, shodan, certificate transparency (high-level concepts, exam-oriented).',
            keywords: ['OSINT', 'passive recon', 'DNS enumeration', 'WHOIS', 'Shodan', 'certificate transparency'],
          },
          {
            id: 'pt-2.2',
            domainId: 'pt-d2',
            certId: 'pentest-plus',
            code: '2.2',
            title: 'Given a scenario, perform active reconnaissance (concepts)',
            description:
              'Network scanning concepts, service enumeration, OS fingerprinting (conceptual), banner grabbing concepts, purpose and authorization requirements.',
            keywords: ['active recon', 'network scanning', 'service enumeration', 'OS fingerprinting', 'authorization'],
          },
          {
            id: 'pt-2.3',
            domainId: 'pt-d2',
            certId: 'pentest-plus',
            code: '2.3',
            title: 'Given a scenario, analyze vulnerability scan results',
            description:
              'Interpreting scanner output, CVSS scoring, false positives, prioritization, correlation with threat intel.',
            keywords: ['vulnerability scan', 'CVSS', 'false positive', 'prioritization', 'scanner output'],
          },
        ],
      },
      {
        id: 'pt-d3',
        certId: 'pentest-plus',
        name: 'Attacks & Exploits (Conceptual)',
        weight: 30,
        objectives: [
          {
            id: 'pt-3.1',
            domainId: 'pt-d3',
            certId: 'pentest-plus',
            code: '3.1',
            title: 'Summarize social engineering attack types',
            description:
              'Phishing, spear phishing, vishing, smishing, impersonation, pretexting — focus on recognition and defense.',
            keywords: ['social engineering', 'phishing', 'vishing', 'smishing', 'pretexting', 'impersonation'],
          },
          {
            id: 'pt-3.2',
            domainId: 'pt-d3',
            certId: 'pentest-plus',
            code: '3.2',
            title: 'Explain network-based attack concepts for testing',
            description:
              'ARP poisoning, DNS attacks, MITM concepts, deauthentication (conceptual) — all from a testing/detection perspective.',
            keywords: ['network attacks', 'ARP poisoning', 'DNS attack', 'MITM', 'deauthentication', 'detection'],
          },
          {
            id: 'pt-3.3',
            domainId: 'pt-d3',
            certId: 'pentest-plus',
            code: '3.3',
            title: 'Explain application-based attack concepts for testing',
            description:
              'OWASP Top 10 (conceptual), injection flaws, broken auth, SSRF, XXE, insecure deserialization — from testing and remediation perspectives.',
            keywords: ['OWASP', 'injection', 'XSS', 'SSRF', 'XXE', 'broken auth', 'web app testing'],
          },
        ],
      },
      {
        id: 'pt-d4',
        certId: 'pentest-plus',
        name: 'Reporting & Communication',
        weight: 18,
        objectives: [
          {
            id: 'pt-4.1',
            domainId: 'pt-d4',
            certId: 'pentest-plus',
            code: '4.1',
            title: 'Compare and contrast components of written reports',
            description:
              'Executive summary, technical findings, risk ratings, remediation recommendations, appendices, evidence handling.',
            keywords: ['pentest report', 'executive summary', 'findings', 'remediation', 'risk rating', 'evidence'],
          },
          {
            id: 'pt-4.2',
            domainId: 'pt-d4',
            certId: 'pentest-plus',
            code: '4.2',
            title: 'Explain post-report delivery activities',
            description:
              'Attestation of findings, data retention, client cleanup, remediation verification, lessons learned.',
            keywords: ['post-report', 'remediation verification', 'data retention', 'cleanup', 'attestation'],
          },
        ],
      },
      {
        id: 'pt-d5',
        certId: 'pentest-plus',
        name: 'Tools & Code Analysis',
        weight: 16,
        objectives: [
          {
            id: 'pt-5.1',
            domainId: 'pt-d5',
            certId: 'pentest-plus',
            code: '5.1',
            title: 'Explain the basic concepts of scripting and software development for pen testing',
            description:
              'Scripting languages (Python, Bash, PowerShell) at a conceptual level, script analysis, identifying malicious vs benign behavior.',
            keywords: ['scripting', 'Python', 'Bash', 'PowerShell', 'code analysis', 'malicious script'],
          },
          {
            id: 'pt-5.2',
            domainId: 'pt-d5',
            certId: 'pentest-plus',
            code: '5.2',
            title: 'Summarize use cases of penetration testing tools (categories)',
            description:
              'Recon tools, scanning tools, exploitation frameworks (conceptual), credential testing tools (conceptual) — exam focus on category/purpose not step-by-step usage.',
            keywords: ['pen test tools', 'recon tools', 'scanning tools', 'exploitation frameworks', 'tool categories'],
          },
        ],
      },
    ],
  },
];

// ─── Helper Functions ────────────────────────────────────────────────────────

export function getCertById(id: string): Cert | undefined {
  return CERTS_DATA.find((c) => c.id === id);
}

export function getDomainById(certId: string, domainId: string) {
  return getCertById(certId)?.domains.find((d) => d.id === domainId);
}

export function getObjectiveById(objectiveId: string) {
  for (const cert of CERTS_DATA) {
    for (const domain of cert.domains) {
      const obj = domain.objectives.find((o) => o.id === objectiveId);
      if (obj) return obj;
    }
  }
  return undefined;
}

export function getAllObjectivesForCert(certId: string) {
  return getCertById(certId)?.domains.flatMap((d) => d.objectives) ?? [];
}

export function getAllObjectivesForDomain(certId: string, domainId: string) {
  return getDomainById(certId, domainId)?.objectives ?? [];
}

export const CERT_COLORS: Record<string, string> = {
  'security-plus': '#e74c3c',
  'network-plus':  '#3498db',
  'cysa-plus':     '#9b59b6',
  'pentest-plus':  '#e67e22',
  'sscp':          '#1abc9c',
  'cissp':         '#2c3e50',
  'az-500':        '#0078d4',
  'sc-200':        '#00b4d8',
};