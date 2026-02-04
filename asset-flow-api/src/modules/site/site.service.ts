import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { Site } from '@/entities/site.entity';

@Injectable()
export class SiteService {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
  ) {}

  create(createSiteDto: CreateSiteDto) {
    const site = this.siteRepository.create(createSiteDto);
    return this.siteRepository.save(site);
  }

  findAll() {
    return this.siteRepository.find();
  }

  async findOne(id: number) {
    const site = await this.siteRepository.findOne({
      where: { id },
    });
    if (!site) {
      throw new NotFoundException(`Site with ID ${id} not found`);
    }
    return site;
  }

  async update(id: number, updateSiteDto: UpdateSiteDto) {
    const result = await this.siteRepository.update(id, updateSiteDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Site with ID ${id} not found`);
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.siteRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Site with ID ${id} not found`);
    }
    return { message: `Site #${id} removed successfully` };
  }
}
